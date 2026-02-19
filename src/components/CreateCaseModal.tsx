import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Trash2,
  Users,
  UserCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useCases, Case } from '../contexts/CasesContext';
import { useAuth } from '../contexts/AuthContext';
import { documentsApi } from '../services/api';
import { showError, showWarning } from '../hooks/useToast';
import { CaseCreationSuccess } from './CaseCreationSuccess';



interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (caseData: Case) => void;
}


type PartyCategory =
  | 'govt-vs-govt'
  | 'govt-vs-public'
  | 'public-vs-govt'
  | 'public-vs-public'
  | '';


export function CreateCaseModal({
  isOpen,
  onClose,
  onSuccess
}: CreateCaseModalProps) {

  const { addCase, refresh } = useCases();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: '' as 'Criminal' | 'Civil' | 'Family' | 'Commercial' | 'Appeal' | '',
    priority: '' as 'High' | 'Medium' | 'Low' | '',
    nextHearing: '',
    registrar: '',
    partyCategory: '' as PartyCategory
  });

  const [plaintiffInfo, setPlaintiffInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [defendantInfo, setDefendantInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [documents, setDocuments] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const isLawyer = user?.role === 'lawyer';

  
  const registrars = [
    { value: 'Registrar Bello', label: 'Registrar Bello (High Court 1)' },
    { value: 'Registrar Chioma', label: 'Registrar Chioma (High Court 2)' },
    { value: 'Registrar Okon', label: 'Registrar Okon (High Court 3)' }
  ];

  const partyCategories = [
    { value: 'govt-vs-govt', label: 'Government vs Government' },
    { value: 'govt-vs-public', label: 'Government vs Public' },
    { value: 'public-vs-govt', label: 'Public vs Government' },
    { value: 'public-vs-public', label: 'Public vs Public' }
  ];

  // Determine which parties are "public" based on category
  const isPlaintiffPublic =
    formData.partyCategory === 'public-vs-govt' ||
    formData.partyCategory === 'public-vs-public';
  const isDefendantPublic =
    formData.partyCategory === 'govt-vs-public' ||
    formData.partyCategory === 'public-vs-public';


  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setDocuments(prev => [...prev, ...Array.from(files)]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.type ||
      !formData.priority ||
      !formData.partyCategory
    ) {
      showWarning('Please fill in all required fields including Party Category');
      return;
    }

    if (isLawyer && !formData.registrar) {
      showWarning('Please assign a registrar to process this case');
      return;
    }

    // Validate public party info
    if (
      isPlaintiffPublic &&
      (!plaintiffInfo.name || !plaintiffInfo.phone || !plaintiffInfo.address)
    ) {
      showWarning('Please fill in all Plaintiff (Public) information');
      return;
    }
    if (
      isDefendantPublic &&
      (!defendantInfo.name || !defendantInfo.phone || !defendantInfo.address)
    ) {
      showWarning('Please fill in all Defendant (Public) information');
      return;
    }


    setIsSubmitting(true);
    setUploadProgress('Creating case...');

    try {
      // Build parties array with contact info for public parties
      const parties = [];

      // Plaintiff
      if (isPlaintiffPublic) {
        parties.push({
          role: 'Plaintiff',
          name: plaintiffInfo.name,
          contactInfo: {
            phone: plaintiffInfo.phone,
            address: plaintiffInfo.address
          }
        });
      } else {
        parties.push({ role: 'Plaintiff', name: 'Government' });
      }

      // Defendant
      if (isDefendantPublic) {
        parties.push({
          role: 'Defendant',
          name: defendantInfo.name,
          contactInfo: {
            phone: defendantInfo.phone,
            address: defendantInfo.address
          }
        });
      } else {
        parties.push({ role: 'Defendant', name: 'Government' });
      }

      // Create the case via context (which calls backend)
      const newCase = await addCase(
        {
          title: formData.title,
          type: formData.type,
          status: isLawyer ? 'Pending Approval' : 'Filed',
          priority: formData.priority,
          nextHearing: formData.nextHearing || 'TBD',
          daysLeft: 30,
          color: 'bg-slate-600',
          pages: documents.length,
          judge: isLawyer ? undefined : user?.name,
          documents: [],
          plaintiffInfo: isPlaintiffPublic ? { ...plaintiffInfo } : undefined,
          defendantInfo: isDefendantPublic ? { ...defendantInfo } : undefined
        },
        parties,
        formData.partyCategory
      );


      // Upload documents if any
      if (documents.length > 0 && newCase.id) {
        setUploadProgress(`Uploading ${documents.length} document(s)...`);
        for (let i = 0; i < documents.length; i++) {
          const file = documents[i];
          setUploadProgress(`Uploading document ${i + 1} of ${documents.length}: ${file.name}...`);
          try {
            await documentsApi.uploadDocument(file, newCase.id, 'evidence', `Uploaded during case creation`);
          } catch (uploadErr) {
            console.error('Failed to upload document:', file.name, uploadErr);
            // Continue with other documents even if one fails
          }
        }
        
        // Refresh cases to get the updated documents from the backend
        await refresh();
      }

      // Reset form and close modal
      setFormData({
        title: '',
        type: '',
        priority: '',
        nextHearing: '',
        registrar: '',
        partyCategory: ''
      });
      setPlaintiffInfo({ name: '', phone: '', address: '' });
      setDefendantInfo({ name: '', phone: '', address: '' });
      setDocuments([]);

      setUploadProgress('');
      onSuccess?.(newCase);
      onClose();

    } catch (err) {


      showError(
        err instanceof Error 
          ? err.message 
          : 'Failed to create case. Check that the backend is running.',
        8000
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }

  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Create New Case
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition-all duration-200 hover:rotate-90"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>


        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <Input 
              label="Case Title *" 
              placeholder="e.g., State vs. John Doe" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              required 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label="Case Type *" 
                value={formData.type} 
                onChange={e => setFormData({ ...formData, type: e.target.value as 'Criminal' | 'Civil' | 'Family' | 'Commercial' | 'Appeal' })} 
                options={[
                  { value: 'Criminal', label: 'Criminal' },
                  { value: 'Civil', label: 'Civil' },
                  { value: 'Family', label: 'Family' },
                  { value: 'Commercial', label: 'Commercial' },
                  { value: 'Appeal', label: 'Appeal' }
                ]} 
                required 
              />

              <Select 
                label="Priority *" 
                value={formData.priority} 
                onChange={e => setFormData({ ...formData, priority: e.target.value as 'High' | 'Medium' | 'Low' })} 
                options={[
                  { value: 'High', label: 'High Priority' },
                  { value: 'Medium', label: 'Medium Priority' },
                  { value: 'Low', label: 'Low Priority' }
                ]} 
                required 
              />
            </div>

            {/* Party Category Section */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Party Category *
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {partyCategories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        partyCategory: cat.value as PartyCategory
                      })
                    }
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.partyCategory === cat.value
                        ? 'border-green-600 bg-green-50 text-green-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${
                          formData.partyCategory === cat.value
                            ? 'border-green-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {formData.partyCategory === cat.value && (
                          <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Plaintiff Public Info */}
            {isPlaintiffPublic && formData.partyCategory && (
              <div className="border-t border-slate-200 pt-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Plaintiff (Public) Information *
                  </h3>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
                  <Input
                    label="Full Name *"
                    placeholder="e.g., Abdullahi Musa Ibrahim"
                    value={plaintiffInfo.name}
                    onChange={(e) =>
                      setPlaintiffInfo({
                        ...plaintiffInfo,
                        name: e.target.value
                      })
                    }
                    required
                  />

                  <Input
                    label="Phone Number *"
                    placeholder="e.g., +234 800 000 0000"
                    type="tel"
                    value={plaintiffInfo.phone}
                    onChange={(e) =>
                      setPlaintiffInfo({
                        ...plaintiffInfo,
                        phone: e.target.value
                      })
                    }
                    required
                  />

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      Address *
                    </label>
                    <textarea
                      className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Enter full residential address..."
                      rows={2}
                      value={plaintiffInfo.address}
                      onChange={(e) =>
                        setPlaintiffInfo({
                          ...plaintiffInfo,
                          address: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Defendant Public Info */}
            {isDefendantPublic && formData.partyCategory && (
              <div className="border-t border-slate-200 pt-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="h-5 w-5 text-amber-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Defendant (Public) Information *
                  </h3>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 space-y-3">
                  <Input
                    label="Full Name *"
                    placeholder="e.g., John Doe"
                    value={defendantInfo.name}
                    onChange={(e) =>
                      setDefendantInfo({
                        ...defendantInfo,
                        name: e.target.value
                      })
                    }
                    required
                  />

                  <Input
                    label="Phone Number *"
                    placeholder="e.g., +234 800 000 0000"
                    type="tel"
                    value={defendantInfo.phone}
                    onChange={(e) =>
                      setDefendantInfo({
                        ...defendantInfo,
                        phone: e.target.value
                      })
                    }
                    required
                  />

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      Address *
                    </label>
                    <textarea
                      className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Enter full residential address..."
                      rows={2}
                      value={defendantInfo.address}
                      onChange={(e) =>
                        setDefendantInfo({
                          ...defendantInfo,
                          address: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            )}


            {isLawyer && (
              <Select 
                label="Assign Registrar *" 
                value={formData.registrar} 
                onChange={e => setFormData({ ...formData, registrar: e.target.value })} 
                options={registrars} 
                placeholder="Select a registrar..." 
                required 
              />
            )}

            <Input 
              label="Requested Hearing Date (Optional)" 
              type="date" 
              value={formData.nextHearing} 
              onChange={e => setFormData({ ...formData, nextHearing: e.target.value })} 
            />
          </div>


          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Case Documents
            </h3>

            <div 
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary hover:bg-slate-50 transition-colors cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                multiple 
                accept=".pdf,.doc,.docx,.jpg,.png" 
                className="hidden" 
                onChange={handleFileUpload} 
                aria-label="Upload case documents"
              />

              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                Click to upload documents
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, DOC, DOCX, JPG, PNG (Max 25MB each)
              </p>
            </div>

            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveDocument(index)} 
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            isLoading={isSubmitting}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadProgress || 'Processing...'}
              </span>
            ) : (
              isLawyer ? 'Submit for Approval' : 'Create Case'
            )}
          </Button>
        </div>


      </div>
    </div>
  );
}

export function CreateCaseModalWithSuccess(props: CreateCaseModalProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCase, setCreatedCase] = useState<Case | null>(null);
  const { user } = useAuth();
  const isLawyer = user?.role === 'lawyer';

  const handleSuccess = (caseData: Case) => {
    setCreatedCase(caseData);
    setShowSuccessModal(true);
  };

  return (
    <>
      <CreateCaseModal {...props} onSuccess={handleSuccess} />
      <CaseCreationSuccess 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        caseData={createdCase}
        isLawyer={isLawyer}
      />
    </>
  );
}
