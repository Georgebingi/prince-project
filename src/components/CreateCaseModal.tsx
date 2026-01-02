import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useCases, CaseDocument } from '../contexts/CasesContext';
import { useAuth } from '../contexts/AuthContext';
interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function CreateCaseModal({
  isOpen,
  onClose
}: CreateCaseModalProps) {
  const {
    addCase
  } = useCases();
  const {
    user
  } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '' as 'Criminal' | 'Civil' | 'Family' | 'Commercial' | 'Appeal' | '',
    priority: '' as 'High' | 'Medium' | 'Low' | '',
    nextHearing: '',
    registrar: '' // Added registrar field
  });
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Only show registrar selection for lawyers
  const isLawyer = user?.role === 'lawyer';
  const registrars = [{
    value: 'Registrar Bello',
    label: 'Registrar Bello (High Court 1)'
  }, {
    value: 'Registrar Chioma',
    label: 'Registrar Chioma (High Court 2)'
  }, {
    value: 'Registrar Okon',
    label: 'Registrar Okon (High Court 3)'
  }];
  if (!isOpen) return null;
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const newDoc: CaseDocument = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'You'
      };
      setDocuments(prev => [...prev, newDoc]);
    });
  };
  const handleRemoveDocument = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.priority) {
      alert('Please fill in all required fields');
      return;
    }
    if (isLawyer && !formData.registrar) {
      alert('Please assign a registrar to process this case');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const colors = {
        Criminal: 'bg-red-600',
        Civil: 'bg-blue-600',
        Family: 'bg-emerald-600',
        Commercial: 'bg-purple-600',
        Appeal: 'bg-amber-600'
      };
      addCase({
        title: formData.title,
        type: formData.type,
        status: isLawyer ? 'Pending Approval' : 'Filed',
        priority: formData.priority,
        nextHearing: formData.nextHearing || 'TBD',
        daysLeft: 30,
        color: colors[formData.type],
        pages: documents.length,
        judge: isLawyer ? undefined : 'Hon. Justice Ibrahim',
        documents: documents
        // Store the assigned registrar in the case data (could be added to Case interface if needed)
      });
      setIsSubmitting(false);
      setFormData({
        title: '',
        type: '',
        priority: '',
        nextHearing: '',
        registrar: ''
      });
      setDocuments([]);
      onClose();
      alert(isLawyer ? 'Case submitted to registrar for approval!' : 'Case created successfully!');
    }, 1000);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Create New Case
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <Input label="Case Title *" placeholder="e.g., State vs. John Doe" value={formData.title} onChange={e => setFormData({
            ...formData,
            title: e.target.value
          })} required />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Case Type *" value={formData.type} onChange={e => setFormData({
              ...formData,
              type: e.target.value as any
            })} options={[{
              value: 'Criminal',
              label: 'Criminal'
            }, {
              value: 'Civil',
              label: 'Civil'
            }, {
              value: 'Family',
              label: 'Family'
            }, {
              value: 'Commercial',
              label: 'Commercial'
            }, {
              value: 'Appeal',
              label: 'Appeal'
            }]} required />

              <Select label="Priority *" value={formData.priority} onChange={e => setFormData({
              ...formData,
              priority: e.target.value as any
            })} options={[{
              value: 'High',
              label: 'High Priority'
            }, {
              value: 'Medium',
              label: 'Medium Priority'
            }, {
              value: 'Low',
              label: 'Low Priority'
            }]} required />
            </div>

            {isLawyer && <Select label="Assign Registrar *" value={formData.registrar} onChange={e => setFormData({
            ...formData,
            registrar: e.target.value
          })} options={registrars} placeholder="Select a registrar..." required />}

            <Input label="Requested Hearing Date (Optional)" type="date" value={formData.nextHearing} onChange={e => setFormData({
            ...formData,
            nextHearing: e.target.value
          })} />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Case Documents
            </h3>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={handleFileUpload} />
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                Click to upload documents
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, DOC, DOCX, JPG, PNG (Max 25MB each)
              </p>
            </div>

            {documents.length > 0 && <div className="mt-4 space-y-2">
                {documents.map(doc => <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {doc.name}
                        </p>
                        <p className="text-xs text-slate-500">{doc.size}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveDocument(doc.id)} className="p-1 hover:bg-slate-200 rounded transition-colors">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>)}
              </div>}
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {isLawyer ? 'Submit for Approval' : 'Create Case'}
          </Button>
        </div>
      </div>
    </div>;
}