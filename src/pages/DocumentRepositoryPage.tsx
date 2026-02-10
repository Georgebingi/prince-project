import React, { useMemo, useState, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { FileText, Folder, UploadCloud, Search, MoreHorizontal, Download, File, Image as ImageIcon, X, Eye } from 'lucide-react';
import { useCases, CaseDocument } from '../contexts/CasesContext';
import { useAuth } from '../contexts/AuthContext';
export function DocumentRepositoryPage() {
  const { cases, addDocumentToCase } = useCases();
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
    uploadedBy: string;
    category?: string;
    caseId: string;
    caseTitle: string;
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'judgment' | 'evidence' | 'affidavit' | 'admin'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'judgment' | 'affidavit' | 'evidence' | 'admin'>('evidence');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  // Get all documents from all cases
  const allDocuments = useMemo(() => {
    const docs: Array<CaseDocument & { caseId: string; caseTitle: string }> = [];
    cases.forEach((c) => {
      c.documents.forEach((doc) => {
        docs.push({
          ...doc,
          caseId: c.id,
          caseTitle: c.title
        });
      });
    });
    return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [cases]);
  // Calculate folder counts
  const folderCounts = useMemo(() => {
    return {
      all: allDocuments.length,
      judgment: allDocuments.filter((d) => d.category === 'judgment').length,
      affidavit: allDocuments.filter((d) => d.category === 'affidavit').length,
      evidence: allDocuments.filter((d) => d.category === 'evidence').length,
      admin: allDocuments.filter((d) => d.category === 'admin').length,
    };
  }, [allDocuments]);
  const folders = [
    { name: 'All Documents', count: folderCounts.all, type: 'all' },
    { name: 'Judgments', count: folderCounts.judgment, type: 'judgment' },
    { name: 'Affidavits', count: folderCounts.affidavit, type: 'affidavit' },
    { name: 'Evidence Files', count: folderCounts.evidence, type: 'evidence' },
    { name: 'Admin Records', count: folderCounts.admin, type: 'admin' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    } else if (e.type === 'drop') {
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };
  const handleFiles = (files: FileList) => {
    if (!selectedCaseId) {
      alert('Please select a case to upload the document to');
      return;
    }
    setUploading(true);
    setTimeout(() => {
      const newDocument: CaseDocument = {
        id: `doc-${Date.now()}`,
        name: files[0].name,
        type: files[0].name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(files[0].size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toLocaleDateString(),
        uploadedBy: user?.name || 'You',
        category: selectedCategory
      };
      addDocumentToCase(selectedCaseId, newDocument);
      setUploading(false);
      alert(`File uploaded successfully to case ${selectedCaseId} as ${selectedCategory}!`);
      setSelectedCaseId('');
    }, 1500);
  };
  const filteredDocs = useMemo(() => {
    let docs = filter === 'all' ? allDocuments : allDocuments.filter((d) => d.category === filter);
    if (searchQuery) {
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.caseId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return docs;
  }, [allDocuments, filter, searchQuery]);

  return (
    <Layout title="Document Repository" showLogoBanner={false}>
      <div className="space-y-6">
        {/* Upload Zone with Category Selection */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Upload New Document
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Select Case" value={selectedCaseId} onChange={(e) => setSelectedCaseId(e.target.value)} options={[{ value: '', label: 'Choose a case...' }, ...cases.map((c) => ({ value: c.id, label: `${c.id} - ${c.title}` }))]} required />
              <Select label="Document Category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as 'judgment' | 'affidavit' | 'evidence' | 'admin')} options={[{ value: 'judgment', label: 'Judgment' }, { value: 'affidavit', label: 'Affidavit' }, { value: 'evidence', label: 'Evidence File' }, { value: 'admin', label: 'Admin Record' }]} required />
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer relative ${dragActive ? 'border-primary bg-blue-50' : 'border-slate-300 hover:border-primary hover:bg-slate-50'} ${!selectedCaseId ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrag}
              onClick={() => selectedCaseId && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput} disabled={!selectedCaseId} aria-label="Upload document" />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-medium">
                    Uploading document...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-white rounded-full shadow-sm">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedCaseId ? 'Upload Document' : 'Select a case first'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {selectedCaseId ? `Drag and drop files here, or click to browse (Category: ${selectedCategory})` : 'Choose a case and category above to upload documents'}
                    </p>
                  </div>
                  {selectedCaseId && (
                    <Button size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      Select Files
                    </Button>
                  )}
                  <p className="text-xs text-slate-400 mt-2">Supported: PDF, DOCX, JPG, PNG (Max 25MB)</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Folders & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          <h3 className="text-lg font-semibold text-slate-900 self-start md:self-center">
            My Files
          </h3>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
          </div>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {folders.map((folder) => (
            <button
              key={folder.name}
              onClick={() => setFilter(folder.type as 'all' | 'judgment' | 'evidence' | 'affidavit' | 'admin')}
              className={`flex flex-col items-center p-4 bg-white border rounded-lg hover:shadow-md transition-all group text-center ${filter === folder.type ? 'border-primary ring-1 ring-primary bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <Folder className={`h-10 w-10 mb-2 transition-colors ${filter === folder.type ? 'text-primary' : 'text-blue-200 group-hover:text-blue-500'}`} />
              <span className={`font-medium text-sm ${filter === folder.type ? 'text-primary' : 'text-slate-700'}`}>
                {folder.name}
              </span>
              <span className="text-xs text-slate-400">{folder.count} files</span>
            </button>
          ))}
        </div>

        {/* Files List */}
        <Card noPadding>
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <span className="font-semibold text-slate-900">
              {filter === 'all' ? 'All Documents' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Files`}
            </span>
            <span className="text-xs text-slate-500">
              {filteredDocs.length} documents
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded text-slate-500">
                      {doc.type === 'PDF' ? <FileText className="h-6 w-6 text-red-500" /> : doc.type === 'Image' || doc.type === 'JPG' || doc.type === 'PNG' ? <ImageIcon className="h-6 w-6 text-purple-500" /> : <File className="h-6 w-6 text-blue-500" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">
                        {doc.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <Badge variant="secondary" className="text-[10px] py-0 h-5">
                          {doc.category || 'uncategorized'}
                        </Badge>
                        <span>{doc.caseId}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadedAt}</span>
                        <span>•</span>
                        <span>by {doc.uploadedBy}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" title="Preview" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Download" onClick={(e) => { e.stopPropagation(); alert(`Downloading ${doc.name}`); }}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>No documents found in this folder.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                {selectedDoc.name}
              </h3>
              <button onClick={() => setSelectedDoc(null)} className="p-1 hover:bg-slate-100 rounded-full" aria-label="Close document viewer">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8 bg-slate-50 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">
                  <strong>Document:</strong> {selectedDoc.name}
                </p>
                <p className="text-sm text-slate-400 mb-2">
                  <strong>Case:</strong> {selectedDoc.caseId} -{' '}
                  {selectedDoc.caseTitle}
                </p>
                <p className="text-sm text-slate-400 mb-2">
                  <strong>Category:</strong> {selectedDoc.category}
                </p>
                <p className="text-sm text-slate-400 mb-2">
                  <strong>Type:</strong> {selectedDoc.type}
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  <strong>Size:</strong> {selectedDoc.size}
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  In a real application, this would display the PDF or document
                  content.
                </p>
                <Button onClick={() => { window.open(`#view-document-${selectedDoc.id}`, '_blank'); alert(`Opening ${selectedDoc.name} in external viewer`); }}>
                  <Download className="h-4 w-4 mr-2" />
                  Open in External Viewer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}