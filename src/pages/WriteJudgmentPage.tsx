import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ArrowLeft, Save, Send, FileText, Eye } from 'lucide-react';
import { useCases } from '../contexts/CasesContext';
export function WriteJudgmentPage() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { cases, submitJudgment } = useCases();
=======
  const {
    cases,
    submitJudgment
  } = useCases();
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [judgmentText, setJudgmentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // Filter only active cases (not closed/disposed)
<<<<<<< HEAD
  const activeCases = cases.filter(
    (c) => c.status !== 'Closed' && c.status !== 'Disposed'
  );
  const caseOptions = activeCases.map((c) => ({
=======
  const activeCases = cases.filter(c => c.status !== 'Closed' && c.status !== 'Disposed');
  const caseOptions = activeCases.map(c => ({
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    value: c.id,
    label: `${c.id} - ${c.title}`
  }));
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Draft saved successfully!');
    }, 1000);
  };
  const handleSubmit = () => {
    if (!selectedCaseId || !judgmentText) {
      alert('Please select a case and write judgment content.');
      return;
    }
<<<<<<< HEAD
    if (
    confirm(
      'Are you sure you want to submit this judgment? This action will CLOSE the case.'
    ))
    {
=======
    if (confirm('Are you sure you want to submit this judgment? This action will CLOSE the case.')) {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
      setIsSaving(true);
      setTimeout(() => {
        submitJudgment(selectedCaseId, judgmentText);
        setIsSaving(false);
        alert('Judgment submitted successfully! The case has been closed.');
        navigate('/dashboard');
      }, 1500);
    }
  };
<<<<<<< HEAD
  return (
    <Layout title="Write Judgment">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}>

=======
  return <Layout title="Write Judgment">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<<<<<<< HEAD
              <Select
                label="Select Case"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                options={caseOptions}
                placeholder="Choose a case..."
                required />

              <div className="flex items-end pb-1">
                <p className="text-sm text-slate-500">
                  {selectedCaseId ?
                  'Case status: Pending Judgment' :
                  'Select a case to begin'}
=======
              <Select label="Select Case" value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)} options={caseOptions} placeholder="Choose a case..." required />
              <div className="flex items-end pb-1">
                <p className="text-sm text-slate-500">
                  {selectedCaseId ? 'Case status: Pending Judgment' : 'Select a case to begin'}
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2">
                <Button variant="ghost" size="sm" className="h-8">
                  <FileText className="h-4 w-4 mr-2" /> Template
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Bold
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Italic
                </Button>
                <div className="flex-1"></div>
                <Button variant="ghost" size="sm" className="h-8">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
              </div>
<<<<<<< HEAD
              <textarea
                className="w-full h-[500px] p-6 focus:outline-none resize-none font-serif text-lg leading-relaxed"
                placeholder="Enter judgment text here..."
                value={judgmentText}
                onChange={(e) => setJudgmentText(e.target.value)}>
              </textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={handleSave}
                isLoading={isSaving}>

=======
              <textarea className="w-full h-[500px] p-6 focus:outline-none resize-none font-serif text-lg leading-relaxed" placeholder="Enter judgment text here..." value={judgmentText} onChange={e => setJudgmentText(e.target.value)}></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={handleSave} isLoading={isSaving}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmit} isLoading={isSaving}>
                <Send className="h-4 w-4 mr-2" />
                Submit Judgment & Close Case
              </Button>
            </div>
          </div>
        </Card>
      </div>
<<<<<<< HEAD
    </Layout>);

=======
    </Layout>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}