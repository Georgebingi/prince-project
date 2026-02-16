import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Gavel, 
  Download, 
  MessageSquare, 
  Upload, 
  X, 
  Eye, 
  Trash2,
  Building2,
  UserCircle,
  Users,
  Phone,
  MapPin,
  Edit2
} from 'lucide-react';
import { useCases, CaseDocument, CaseNote, type Case } from '../contexts/CasesContext';
import { useAuth } from '../contexts/AuthContext';
import { EditCaseModal } from '../components/EditCaseModal';
import { casesApi, documentsApi } from '../services/api';
import { showSuccess } from '../hooks/useToast';
import { handleApiError } from '../utils/errorHandler';


function mapBackendDocToFrontend(d: { id: number; name: string; type: string; file_size?: number; uploaded_at?: string; uploaded_by_name?: string }): CaseDocument {
  return {
    id: String(d.id),
    name: d.name,
    type: d.type,
    size: d.file_size ? `${(d.file_size / 1024).toFixed(1)} KB` : '0 KB',
    uploadedAt: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : '',
    uploadedBy: d.uploaded_by_name ?? 'Unknown'
  };
}

interface PartyInfo {
  name: string;
  phone: string;
  address: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: string;
}

export default function CaseDetailPage() {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getCaseById, addDocumentToCase, removeDocumentFromCase, updateCaseStatus, scheduleHearing, addNoteToCase, refresh, deleteCase } = useCases();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldOpenDocuments = location.state?.openDocuments === true;
  type TabId = 'overview' | 'documents' | 'timeline' | 'notes';
  const [activeTab, setActiveTab] = useState<TabId>(shouldOpenDocuments ? 'documents' : 'overview');
  const [selectedDocument, setSelectedDocument] = useState<CaseDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [caseDetailFromApi, setCaseDetailFromApi] = useState<Case | null>(null);
  const [caseNumericId, setCaseNumericId] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  
  // Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form States
  const [newStatus, setNewStatus] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [noteText, setNoteText] = useState('');
  
  // Party information from backend
  const [plaintiffInfo, setPlaintiffInfo] = useState<PartyInfo | null>(null);
  const [defendantInfo, setDefendantInfo] = useState<PartyInfo | null>(null);
  const [partyCategory, setPartyCategory] = useState<Case['partyCategory'] | null>(null);


  
  // Notes from backend
  const [notesFromApi, setNotesFromApi] = useState<CaseNote[]>([]);
  
  // Timeline from backend
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  const decodedId = id ? decodeURIComponent(id) : '';
  
  // Check if user can delete cases (Chief Judge, Admin, or Court Admin)
  const canDeleteCases = user?.role === 'judge' || user?.role === 'admin' || user?.role === 'court_admin';

  // Helper to get readable party category label
  const getPartyCategoryLabel = (category?: string) => {
    if (!category) return null;
    const map: Record<string, string> = {
      'govt-vs-govt': 'Government vs Government',
      'govt-vs-public': 'Government vs Public',
      'public-vs-govt': 'Public vs Government',
      'public-vs-public': 'Public vs Public'
    };
    return map[category] || category;
  };

  const partyCategoryLabel = getPartyCategoryLabel(partyCategory || caseDetailFromApi?.partyCategory);

  const fetchCaseDetail = useCallback(async () => {
    if (!decodedId) return;
    setLoadingDetail(true);
    try {
      const res = await casesApi.getCaseById(decodedId);
      if (res.success && res.data) {
        const d = res.data as {
          id: number;
          case_number: string;
          title: string;
          type: string;
          status: string;
          priority: string;
          next_hearing?: string | null;
          filed_date?: string;
          judge_name?: string | null;
          court?: string | null;
          updated_at?: string;
          documents?: Array<{ id: number; name: string; type: string; file_size?: number; uploaded_at?: string; uploaded_by_name?: string }>;
          parties?: Array<{
            role: string;
            name: string;
            phone?: string;
            address?: string;
            is_government?: boolean;
          }>;
          party_category?: string;
          notes?: Array<{ id?: number; content?: string; text?: string; created_at?: string; author_name?: string; author?: string }>;
        };
        setCaseNumericId(d.id);
        
        // Extract party information
        if (d.parties && d.parties.length > 0) {
          const plaintiff = d.parties.find((p: { role?: string; name?: string; phone?: string; address?: string }) => p.role?.toLowerCase() === 'plaintiff');
          const defendant = d.parties.find((p: { role?: string; name?: string; phone?: string; address?: string }) => p.role?.toLowerCase() === 'defendant');

          
          if (plaintiff) {
            setPlaintiffInfo({
              name: plaintiff.name || '',
              phone: plaintiff.phone || '',
              address: plaintiff.address || ''
            });
          }
          
          if (defendant) {
            setDefendantInfo({
              name: defendant.name || '',
              phone: defendant.phone || '',
              address: defendant.address || ''
            });
          }
          
          setPartyCategory((d.party_category as Case['partyCategory']) || null);

        }

        // Map notes from API response
        const mappedNotes: CaseNote[] = d.notes?.map((n: { id?: number; content?: string; text?: string; created_at?: string; author_name?: string; author?: string }) => ({
          id: String(n.id),
          text: n.content || n.text || '',
          createdAt: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
          author: n.author_name || n.author || 'Unknown'
        })) ?? [];
        
        if (mappedNotes.length > 0) {
          setNotesFromApi(mappedNotes);
        }

        setCaseDetailFromApi({
          id: d.case_number ?? String(d.id),
          title: d.title ?? '',
          type: (d.type as Case['type']) ?? 'Civil',
          status: d.status ?? 'Pending',
          priority: (d.priority as Case['priority']) ?? 'Medium',
          nextHearing: d.next_hearing ? new Date(d.next_hearing).toLocaleDateString() : 'TBD',
          daysLeft: 0,
          color: 'bg-slate-600',
          pages: d.documents?.length ?? 0,
          judge: d.judge_name ?? undefined,
          court: d.court ?? undefined,
          filed: d.filed_date ? new Date(d.filed_date).toLocaleDateString() : '',
          updated: d.updated_at ? new Date(d.updated_at).toLocaleDateString() : '',
          documents: (d.documents ?? []).map(mapBackendDocToFrontend),
          notes: mappedNotes,
          partyCategory: (d.party_category as Case['partyCategory']) || undefined

        });
      }
    } catch {
      setCaseDetailFromApi(null);
      setCaseNumericId(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [decodedId]);


  // Notes are now fetched as part of fetchCaseDetail to avoid circular dependencies


  // Fetch timeline from backend
  const fetchTimeline = useCallback(async () => {
    if (!caseNumericId) return;
    try {
      const res = await casesApi.getCaseById(decodedId);
      if (res.success && res.data) {
        const d = res.data as { 
          timeline?: Array<{ date?: string; title?: string; description?: string; type?: string }>;
          updated_at?: string;
          filed_date?: string;
          judge_name?: string;
        };
        if (d.timeline && Array.isArray(d.timeline)) {

          const mappedTimeline: TimelineEvent[] = d.timeline.map((t: { date?: string; title?: string; description?: string; type?: string }) => ({

            date: t.date ? new Date(t.date).toLocaleDateString() : 'Recent',
            title: t.title || 'Case Updated',
            description: t.description || '',
            type: t.type || 'admin'
          }));
          setTimeline(mappedTimeline);
        } else {
          // Create default timeline from case data
          const defaultTimeline: TimelineEvent[] = [];
          if (d.updated_at) {
            defaultTimeline.push({
              date: new Date().toISOString().split('T')[0],
              title: 'Case Updated',
              description: 'Case details were modified.',
              type: 'admin'
            });
          }
          if (d.filed_date) {
            defaultTimeline.push({
              date: new Date(d.filed_date).toLocaleDateString(),
              title: 'Case Filed',
              description: `Case registered by ${d.judge_name || 'System'}.`,
              type: 'admin'
            });
          }
          setTimeline(defaultTimeline);
        }
      }
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
      // Set default timeline on error
      if (caseDetailFromApi) {
        setTimeline([
          {
            date: caseDetailFromApi.updated === 'Just now' ? new Date().toISOString().split('T')[0] : 'Recent',
            title: 'Case Updated',
            description: 'Case details were modified.',
            type: 'admin'
          },
          {
            date: caseDetailFromApi.filed,
            title: 'Case Filed',
            description: `Case registered by ${caseDetailFromApi.judge}.`,
            type: 'admin'
          }
        ]);
      }
    }
  }, [caseNumericId, decodedId, caseDetailFromApi]);

  useEffect(() => {
    fetchCaseDetail();
  }, [fetchCaseDetail]);

  useEffect(() => {
    if (caseNumericId) {
      fetchTimeline();
    }
  }, [caseNumericId, fetchTimeline]);


  useEffect(() => {
    if (shouldOpenDocuments) setActiveTab('documents');
  }, [shouldOpenDocuments]);

  const caseDataFromContext = getCaseById(decodedId);
  const caseData = caseDetailFromApi ?? caseDataFromContext;
  const isLawyer = user?.role === 'lawyer';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !decodedId) return;
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    if (caseNumericId != null) {
      setUploading(true);
      try {
        for (const file of fileList) {
          await documentsApi.uploadDocument(file, String(caseNumericId), 'evidence');
        }
        await fetchCaseDetail();
        await refresh();
        showSuccess(fileList.length === 1 ? 'Document uploaded successfully!' : `${fileList.length} documents uploaded successfully!`);
      } catch (err) {
        handleApiError(err, 'Document Upload');
      } finally {
        setUploading(false);
      }
    } else {
      setUploading(true);
      fileList.forEach((file) => {
        const newDoc: CaseDocument = {
          id: `doc-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: user?.name ?? 'You'
        };
        addDocumentToCase(decodedId, newDoc);
      });
      setUploading(false);
      showSuccess(fileList.length === 1 ? 'Document added.' : `${fileList.length} documents added.`);
    }
    e.target.value = '';
  };

  const handleViewDocument = (doc: CaseDocument) => {
    setSelectedDocument(doc);
  };

  const handleDeleteDocument = (e: React.MouseEvent, docId: string, docName: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${docName}"? This action cannot be undone.`)) {
      removeDocumentFromCase(decodedId, docId);
      fetchCaseDetail();
    }
  };

  const handleExport = () => {
    if (!caseData) return;
    const data = JSON.stringify(caseData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Case_${caseData.id.replace(/\//g, '-')}_Details.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Case details exported successfully!');
  };


  const handleUpdateStatus = async () => {
    if (newStatus) {
      try {
        await casesApi.updateCase(decodedId, { status: newStatus });
        updateCaseStatus(decodedId, newStatus);
        await fetchCaseDetail();
        setShowStatusModal(false);
        setNewStatus('');
        showSuccess('Case status updated!');
      } catch (err) {
        updateCaseStatus(decodedId, newStatus);
        setShowStatusModal(false);
        setNewStatus('');
        showSuccess('Case status updated locally!');
      }
    }
  };

  const handleScheduleHearing = async () => {
    if (hearingDate) {
      try {
        const hearingDateISO = new Date(hearingDate).toISOString().split('T')[0];
        await casesApi.scheduleHearing(decodedId, hearingDateISO);
        scheduleHearing(decodedId, hearingDate);
        await fetchCaseDetail();
        setShowHearingModal(false);
        setHearingDate('');
        showSuccess('Hearing scheduled successfully!');
      } catch (err) {
        scheduleHearing(decodedId, hearingDate);
        setShowHearingModal(false);
        setHearingDate('');
        showSuccess('Hearing scheduled locally!');
      }
    }
  };

  const handleAddNote = () => {
    if (noteText) {
      const newNote: CaseNote = {
        id: `note-${Date.now()}`,
        text: noteText,
        createdAt: new Date().toISOString().split('T')[0],
        author: user?.name || 'You'
      };
      setNotesFromApi(prev => [...prev, newNote]);
      addNoteToCase(decodedId, noteText);
      setShowNoteModal(false);
      setNoteText('');
      setActiveTab('notes');
      showSuccess('Note added successfully!');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCase(decodedId);
      setShowDeleteModal(false);
      showSuccess('Case deleted successfully!');
      navigate('/cases');
    } catch (err) {
      handleApiError(err, 'Delete Case');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get all notes (from API or local)
  const allNotes = notesFromApi.length > 0 ? notesFromApi : (caseData?.notes || []);

  if (loadingDetail && !caseData) {
    return (
      <Layout title="Case" showLogoBanner={false}>
        <Card><div className="p-8 text-center text-slate-500">Loading case...</div></Card>
      </Layout>
    );
  }

  if (!caseData) {
    return (
      <Layout title="Case Not Found" showLogoBanner={false}>
        <Card>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Case Not Found</h2>
            <p className="text-slate-500 mb-4">The case you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/cases')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title={`Case Details: ${caseData?.id ?? ''}`} showLogoBanner={false}>
      <div className="space-y-6">
        {/* Header / Navigation */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
          <div className="flex-1"></div>
          <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Case
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canDeleteCases && (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={handleDeleteClick}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Case
            </Button>
          )}
          {!isLawyer && (
            <Button size="sm" onClick={() => setShowStatusModal(true)}>
              <Gavel className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          )}
        </div>

        {/* Case Header Card */}
        <Card>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge variant="danger" className="uppercase tracking-wider text-[10px]">
                  {caseData?.type ?? ''}
                </Badge>
                <Badge variant="warning" className="uppercase tracking-wider text-[10px]">
                  {caseData?.status ?? ''}
                </Badge>
                {partyCategoryLabel && (
                  <Badge variant="secondary" className="tracking-wider text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                    <Users className="h-3 w-3 mr-1 inline" />
                    {partyCategoryLabel}
                  </Badge>
                )}
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Filed: {caseData?.filed ?? ''}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {caseData?.title ?? ''}
              </h1>
              <p className="text-slate-600 max-w-3xl">Case ID: {caseData?.id ?? ''}</p>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px] border-l border-slate-100 pl-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Presiding Judge
                </p>
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <User className="h-4 w-4 text-slate-400" />
                  {caseData?.judge || 'Unassigned'}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Next Hearing
                </p>
                <div className="flex items-center gap-2 font-medium text-red-600">
                  <Calendar className="h-4 w-4" />
                  {caseData?.nextHearing ?? ''}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Priority
                </p>
                <Badge variant={caseData?.priority === 'High' ? 'danger' : caseData?.priority === 'Medium' ? 'warning' : 'secondary'}>
                  {caseData?.priority ?? ''}
                </Badge>
              </div>
            </div>
          </div>
        </Card>


        {/* Party Information Cards - shown when party category exists */}
        {(partyCategory || plaintiffInfo || defendantInfo) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plaintiff Side */}
            <Card className={plaintiffInfo ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-slate-700'}>
              <div className="flex items-center gap-2 mb-3">
                {plaintiffInfo ? (
                  <UserCircle className="h-5 w-5 text-blue-600" />
                ) : (
                  <Building2 className="h-5 w-5 text-slate-700" />
                )}
                <h4 className="font-semibold text-slate-900 text-sm">
                  Plaintiff — {partyCategory?.startsWith('public') ? 'Public' : 'Government'}
                </h4>
              </div>
              {plaintiffInfo ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-900">{plaintiffInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600">{plaintiffInfo.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                    <span className="text-slate-600">{plaintiffInfo.address}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Government Entity</p>
              )}
            </Card>

            {/* Defendant Side */}
            <Card className={defendantInfo ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-slate-700'}>
              <div className="flex items-center gap-2 mb-3">
                {defendantInfo ? (
                  <UserCircle className="h-5 w-5 text-amber-600" />
                ) : (
                  <Building2 className="h-5 w-5 text-slate-700" />
                )}
                <h4 className="font-semibold text-slate-900 text-sm">
                  Defendant — {partyCategory?.endsWith('public') ? 'Public' : 'Government'}
                </h4>
              </div>
              {defendantInfo ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-900">{defendantInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600">{defendantInfo.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                    <span className="text-slate-600">{defendantInfo.address}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Government Entity</p>
              )}
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-6 overflow-x-auto">
            {(['Overview', 'Documents', 'Timeline', 'Notes'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab.toLowerCase() as TabId)}
                className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.toLowerCase() ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab} {tab === 'Documents' && `(${caseData?.documents?.length ?? 0})`}

                {activeTab === tab.toLowerCase() && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                <Card>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Case Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">Case Type</p>
                      <p className="font-medium text-slate-900">{caseData?.type ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                      <p className="font-medium text-slate-900">{caseData?.status ?? ''}</p>
                    </div>
                    {partyCategoryLabel && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">Party Category</p>
                        <p className="font-medium text-slate-900">{partyCategoryLabel}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">Filed Date</p>
                      <p className="font-medium text-slate-900">{caseData?.filed ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">Last Updated</p>
                      <p className="font-medium text-slate-900">{caseData?.updated ?? ''}</p>
                    </div>
                    {caseData?.court && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">Court</p>
                        <p className="font-medium text-slate-900">{caseData.court}</p>
                      </div>
                    )}
                    {caseData?.lawyer && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">Assigned Lawyer</p>
                        <p className="font-medium text-slate-900">{caseData.lawyer}</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Documents Summary</h3>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-slate-900">{caseData?.documents?.length ?? 0} Documents</p>
                        <p className="text-sm text-slate-600">Click Documents tab to view all files</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setActiveTab('documents')}>View All</Button>
                  </div>
                </Card>
              </>
            )}


            {activeTab === 'documents' && (
              <Card noPadding>
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">Case Documents</h3>
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} isLoading={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      className="hidden"
                      onChange={handleFileUpload}
                      aria-label="Upload case document"
                    />
                  </div>
                </div>

                {(caseData?.documents?.length ?? 0) > 0 ? (

                  <div className="divide-y divide-slate-100">
                    {caseData?.documents?.map((doc) => (

                      <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 text-red-600 rounded">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{doc.name}</p>
                            <p className="text-xs text-slate-500">
                              {doc.type} • {doc.uploadedAt} • {doc.size} • by {doc.uploadedBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleViewDocument(doc)} title="View Document">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { showSuccess(`Downloading ${doc.name}`); }} title="Download Document">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600" onClick={(e) => handleDeleteDocument(e, doc.id, doc.name)} title="Delete Document">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No documents uploaded yet.</p>
                    <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Document
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'timeline' && (
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-2">
                {timeline.length > 0 ? (
                  timeline.map((event, i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white bg-slate-400"></div>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-slate-900">{event.title}</h4>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {event.date}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No timeline events yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Case Notes</h3>
                  <Button size="sm" onClick={() => setShowNoteModal(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {allNotes.length > 0 ? (
                  <div className="space-y-4">
                    {allNotes.map((note) => (
                      <Card key={note.id}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-900">{note.author}</span>
                          <span className="text-xs text-slate-500">{note.createdAt}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{note.text}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No notes added yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Quick Actions</h3>
              <div className="space-y-2">
                {!isLawyer && (
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setShowHearingModal(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Hearing
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setShowNoteModal(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
                {canDeleteCases && (
                  <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50" size="sm" onClick={handleDeleteClick}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Case
                  </Button>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Case Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Documents</span>
                  <span className="font-semibold text-slate-900">{caseData?.documents?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Days Left</span>
                  <span className="font-semibold text-slate-900">{caseData?.daysLeft ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Priority</span>
                  <Badge variant={caseData?.priority === 'High' ? 'danger' : caseData?.priority === 'Medium' ? 'warning' : 'secondary'}>
                    {caseData?.priority ?? ''}
                  </Badge>
                </div>
              </div>

            </Card>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                {selectedDocument.name}
              </h3>
              <button type="button" onClick={() => setSelectedDocument(null)} className="p-1 hover:bg-slate-100 rounded-full" aria-label="Close document preview">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8 bg-slate-50 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Document preview for: {selectedDocument.name}</p>
                <p className="text-sm text-slate-400 mb-4">In a real application, this would display the PDF or document content.</p>
                <Button onClick={() => showSuccess(`Downloading ${selectedDocument.name}`)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Update Case Status</h3>
            <Select
              label="New Status"
              options={[
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Pending Judgment', label: 'Pending Judgment' },
                { value: 'Review', label: 'Review' },
                { value: 'Disposed', label: 'Disposed' },
                { value: 'Adjourned', label: 'Adjourned' }
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="Select status..."
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>Cancel</Button>
              <Button onClick={handleUpdateStatus}>Update</Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Hearing Modal */}
      {showHearingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Hearing</h3>
            <Input
              label="Hearing Date"
              type="date"
              value={hearingDate}
              onChange={(e) => setHearingDate(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowHearingModal(false)}>Cancel</Button>
              <Button onClick={handleScheduleHearing}>Schedule</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Case Note</h3>
            <textarea
              className="w-full h-32 p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter note details..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowNoteModal(false)}>Cancel</Button>
              <Button onClick={handleAddNote}>Save Note</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Case Modal */}
      {showEditModal && caseData && (
        <EditCaseModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          caseData={caseData}
        />
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Delete Case</h3>
            </div>
            <p className="text-slate-600 mb-2">Are you sure you want to delete this case?</p>
            <p className="text-sm text-slate-500 mb-6">Case ID: <span className="font-mono font-medium">{decodedId}</span></p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800"><strong>Warning:</strong> This action cannot be undone. All case data, including documents, parties, and timeline entries will be permanently removed.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} isLoading={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete Case'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
