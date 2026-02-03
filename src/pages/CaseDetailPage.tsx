import React, {
  useEffect,
  useState,
  useRef,
  createElement,
  Component } from
'react';
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
  Save } from
'lucide-react';
import { useCases, CaseDocument } from '../contexts/CasesContext';
import { useAuth } from '../contexts/AuthContext';
export function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getCaseById,
    addDocumentToCase,
    updateCaseStatus,
    scheduleHearing,
    addNoteToCase
  } = useCases();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Check if we should open documents tab directly (from "Open Case" button)
  const shouldOpenDocuments = location.state?.openDocuments === true;
  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'timeline' | 'notes'>(
    shouldOpenDocuments ? 'documents' : 'overview');
  const [selectedDocument, setSelectedDocument] = useState<CaseDocument | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  // Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  // Form States
  const [newStatus, setNewStatus] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [noteText, setNoteText] = useState('');
  // Decode ID from URL
  const decodedId = id ? decodeURIComponent(id) : '';
  const caseData = getCaseById(decodedId);
  // Check user role
  const isLawyer = user?.role === 'lawyer';
  // Set documents tab when coming from "Open Case" button
  useEffect(() => {
    if (shouldOpenDocuments) {
      setActiveTab('documents');
    }
  }, [shouldOpenDocuments]);
  if (!caseData) {
    return (
      <Layout title="Case Not Found">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Case Not Found
            </h2>
            <p className="text-slate-500 mb-4">
              The case you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/cases')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
          </div>
        </Card>
      </Layout>);

  }
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !decodedId) return;
    setUploading(true);
    Array.from(files).forEach((file) => {
      setTimeout(() => {
        const newDoc: CaseDocument = {
          id: `doc-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'You'
        };
        addDocumentToCase(decodedId, newDoc);
        setUploading(false);
        alert('Document uploaded successfully!');
      }, 1000);
    });
  };
  const handleViewDocument = (doc: CaseDocument) => {
    setSelectedDocument(doc);
  };
  const handleExport = () => {
    const data = JSON.stringify(caseData, null, 2);
    const blob = new Blob([data], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Case_${caseData.id.replace(/\//g, '-')}_Details.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Case details exported successfully!');
  };
  const handleUpdateStatus = () => {
    if (newStatus) {
      updateCaseStatus(decodedId, newStatus);
      setShowStatusModal(false);
      setNewStatus('');
      alert('Case status updated!');
    }
  };
  const handleScheduleHearing = () => {
    if (hearingDate) {
      scheduleHearing(decodedId, hearingDate);
      setShowHearingModal(false);
      setHearingDate('');
      alert('Hearing scheduled successfully!');
    }
  };
  const handleAddNote = () => {
    if (noteText) {
      addNoteToCase(decodedId, noteText);
      setShowNoteModal(false);
      setNoteText('');
      setActiveTab('notes'); // Switch to notes tab to see it
      alert('Note added successfully!');
    }
  };
  // Mock timeline data combined with real updates
  const timeline = [
  {
    date:
    caseData.updated === 'Just now' ?
    new Date().toISOString().split('T')[0] :
    'Recent',
    title: 'Case Updated',
    description: 'Case details were modified.',
    type: 'admin'
  },
  {
    date: caseData.filed,
    title: 'Case Filed',
    description: `Case registered by ${caseData.judge}.`,
    type: 'admin'
  }];

  return (
    <Layout title={`Case Details: ${caseData.id}`}>
      <div className="space-y-6">
        {/* Header / Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
          <div className="flex-1"></div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {!isLawyer &&
          <Button size="sm" onClick={() => setShowStatusModal(true)}>
              <Gavel className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          }
        </div>

        {/* Case Header Card */}
        <Card>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant="danger"
                  className="uppercase tracking-wider text-[10px]">

                  {caseData.type}
                </Badge>
                <Badge
                  variant="warning"
                  className="uppercase tracking-wider text-[10px]">

                  {caseData.status}
                </Badge>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Filed: {caseData.filed}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {caseData.title}
              </h1>
              <p className="text-slate-600 max-w-3xl">Case ID: {caseData.id}</p>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px] border-l border-slate-100 pl-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Presiding Judge
                </p>
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <User className="h-4 w-4 text-slate-400" />
                  {caseData.judge || 'Unassigned'}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Next Hearing
                </p>
                <div className="flex items-center gap-2 font-medium text-red-600">
                  <Calendar className="h-4 w-4" />
                  {caseData.nextHearing}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Priority
                </p>
                <Badge
                  variant={
                  caseData.priority === 'High' ?
                  'danger' :
                  caseData.priority === 'Medium' ?
                  'warning' :
                  'secondary'
                  }>

                  {caseData.priority}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-6 overflow-x-auto">
            {['Overview', 'Documents', 'Timeline', 'Notes'].map((tab) =>
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as any)}
              className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}>

                {tab} {tab === 'Documents' && `(${caseData.documents.length})`}
                {activeTab === tab.toLowerCase() &&
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
              }
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' &&
            <>
                <Card>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Case Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Case Type
                      </p>
                      <p className="font-medium text-slate-900">
                        {caseData.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Status
                      </p>
                      <p className="font-medium text-slate-900">
                        {caseData.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Filed Date
                      </p>
                      <p className="font-medium text-slate-900">
                        {caseData.filed}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Last Updated
                      </p>
                      <p className="font-medium text-slate-900">
                        {caseData.updated}
                      </p>
                    </div>
                    {caseData.court &&
                  <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">
                          Court
                        </p>
                        <p className="font-medium text-slate-900">
                          {caseData.court}
                        </p>
                      </div>
                  }
                    {caseData.lawyer &&
                  <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">
                          Assigned Lawyer
                        </p>
                        <p className="font-medium text-slate-900">
                          {caseData.lawyer}
                        </p>
                      </div>
                  }
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Documents Summary
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {caseData.documents.length} Documents
                        </p>
                        <p className="text-sm text-slate-600">
                          Click Documents tab to view all files
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setActiveTab('documents')}>
                      View All
                    </Button>
                  </div>
                </Card>
              </>
            }

            {activeTab === 'documents' &&
            <Card noPadding>
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">
                      Case Documents
                    </h3>
                    <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={uploading}>

                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    className="hidden"
                    onChange={handleFileUpload} />

                  </div>
                </div>

                {caseData.documents.length > 0 ?
              <div className="divide-y divide-slate-100">
                    {caseData.documents.map((doc) =>
                <div
                  key={doc.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 text-red-600 rounded">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {doc.type} • {doc.uploadedAt} • {doc.size} • by{' '}
                              {doc.uploadedBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(doc)}>

                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(`Downloading ${doc.name}`)}>

                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                )}
                  </div> :

              <div className="p-12 text-center text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No documents uploaded yet.</p>
                    <Button
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}>

                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Document
                    </Button>
                  </div>
              }
              </Card>
            }

            {activeTab === 'timeline' &&
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-2">
                {timeline.map((event, i) =>
              <div key={i} className="relative pl-8">
                    <div
                  className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white bg-slate-400`}>
                </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-900">
                          {event.title}
                        </h4>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {event.description}
                      </p>
                    </div>
                  </div>
              )}
              </div>
            }

            {activeTab === 'notes' &&
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Case Notes
                  </h3>
                  <Button size="sm" onClick={() => setShowNoteModal(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {caseData.notes && caseData.notes.length > 0 ?
              <div className="space-y-4">
                    {caseData.notes.map((note) =>
                <Card key={note.id}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-900">
                            {note.author}
                          </span>
                          <span className="text-xs text-slate-500">
                            {note.createdAt}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {note.text}
                        </p>
                      </Card>
                )}
                  </div> :

              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No notes added yet.</p>
                  </div>
              }
              </div>
            }
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {!isLawyer &&
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => setShowHearingModal(true)}>

                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Hearing
                  </Button>
                }
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}>

                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => setShowNoteModal(true)}>

                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
                Case Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Documents</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.documents.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Days Left</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.daysLeft}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Priority</span>
                  <Badge
                    variant={
                    caseData.priority === 'High' ?
                    'danger' :
                    caseData.priority === 'Medium' ?
                    'warning' :
                    'secondary'
                    }>

                    {caseData.priority}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                {selectedDocument.name}
              </h3>
              <button
              onClick={() => setSelectedDocument(null)}
              className="p-1 hover:bg-slate-100 rounded-full">

                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8 bg-slate-50 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">
                  Document preview for: {selectedDocument.name}
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  In a real application, this would display the PDF or document
                  content.
                </p>
                <Button
                onClick={() => alert(`Downloading ${selectedDocument.name}`)}>

                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            </div>
          </div>
        </div>
      }

      {/* Update Status Modal */}
      {showStatusModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Update Case Status</h3>
            <Select
            label="New Status"
            options={[
            {
              value: 'In Progress',
              label: 'In Progress'
            },
            {
              value: 'Pending Judgment',
              label: 'Pending Judgment'
            },
            {
              value: 'Review',
              label: 'Review'
            },
            {
              value: 'Disposed',
              label: 'Disposed'
            },
            {
              value: 'Adjourned',
              label: 'Adjourned'
            }]
            }
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="Select status..." />

            <div className="flex justify-end gap-2 mt-6">
              <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}>

                Cancel
              </Button>
              <Button onClick={handleUpdateStatus}>Update</Button>
            </div>
          </div>
        </div>
      }

      {/* Schedule Hearing Modal */}
      {showHearingModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Hearing</h3>
            <Input
            label="Hearing Date"
            type="date"
            value={hearingDate}
            onChange={(e) => setHearingDate(e.target.value)} />

            <div className="flex justify-end gap-2 mt-6">
              <Button
              variant="outline"
              onClick={() => setShowHearingModal(false)}>

                Cancel
              </Button>
              <Button onClick={handleScheduleHearing}>Schedule</Button>
            </div>
          </div>
        </div>
      }

      {/* Add Note Modal */}
      {showNoteModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Case Note</h3>
            <textarea
            className="w-full h-32 p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter note details..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}>
          </textarea>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowNoteModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>Save Note</Button>
            </div>
          </div>
        </div>
      }
    </Layout>);

}