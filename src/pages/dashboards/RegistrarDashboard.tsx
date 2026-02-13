import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import {
  FolderOpen,
  Calendar,
  Clock,
  FileText,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  Scale,
  Gavel,
  BookOpen
} from 'lucide-react';

import { useCases } from '../../contexts/CasesContext';
import { CreateCaseModal } from '../../components/CreateCaseModal';
export function RegistrarDashboard() {
  const navigate = useNavigate();
  const { cases, assignCaseToCourt, scheduleHearing, approveCaseRegistration } =
  useCases();
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  // Form States
  const [assignCourt, setAssignCourt] = useState('');
  const [assignJudge, setAssignJudge] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  // Dynamic Stats Calculation
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      newFilings: cases.filter(
        (c) => c.status === 'Filed' || c.status === 'Pending Approval'
      ).length,
      pendingAssignment: cases.filter((c) => !c.judge || c.status === 'Filed').
      length,
      hearingsToday: cases.filter((c) => c.nextHearing === today).length,
      documentsProcessed: cases.reduce(
        (acc, curr) => acc + curr.documents.length,
        0
      )
    };
  }, [cases]);
  // Filter cases for lists
  const pendingAssignmentCases = cases.
  filter((c) => !c.judge || c.status === 'Filed').
  slice(0, 5);
  const pendingRegistrationCases = cases.
  filter((c) => c.status === 'Pending Approval').
  slice(0, 5);
  const upcomingHearings = cases.
  filter((c) => c.nextHearing && c.nextHearing !== 'TBD').
  sort(
    (a, b) =>
    new Date(a.nextHearing).getTime() - new Date(b.nextHearing).getTime()
  ).
  slice(0, 5);
  // Judge's active cases - synced to registrar view
  const judgeCases = useMemo(() => {
    return cases.filter(
      (c) =>
      c.judge &&
      c.judge !== 'Unassigned' &&
      c.status !== 'Closed' &&
      c.status !== 'Disposed'
    );
  }, [cases]);
  const judgeStats = useMemo(() => {
    const pendingJudgment = judgeCases.filter(
      (c) => c.status === 'Pending Judgment'
    ).length;
    const inProgress = judgeCases.filter(
      (c) => c.status === 'In Progress'
    ).length;
    const totalActive = judgeCases.length;
    return {
      pendingJudgment,
      inProgress,
      totalActive
    };
  }, [judgeCases]);

  const handleAssignClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setShowAssignModal(true);
  };
  const handleScheduleClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setShowHearingModal(true);
  };
  const handleReviewClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setShowReviewModal(true);
  };
  const submitAssignment = () => {
    if (selectedCaseId && assignCourt && assignJudge) {
      assignCaseToCourt(selectedCaseId, assignCourt, assignJudge);
      setShowAssignModal(false);
      setAssignCourt('');
      setAssignJudge('');
      alert('Case assigned successfully!');
    }
  };
  const submitHearing = () => {
    if (selectedCaseId && hearingDate) {
      scheduleHearing(selectedCaseId, hearingDate);
      setShowHearingModal(false);
      setHearingDate('');
      alert('Hearing scheduled successfully!');
    }
  };
  const submitApproval = () => {
    if (selectedCaseId) {
      approveCaseRegistration(selectedCaseId);
      setShowReviewModal(false);
      alert('Case registration approved and filed!');
    }
  };
  return <Layout title="Registrar Dashboard" showLogoBanner={false}>
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">New Filings</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.newFilings}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  Pending Assignment
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.pendingAssignment}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Hearings Today</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.hearingsToday}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Calendar className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Docs Processed</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.documentsProcessed}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Judge's Cases Overview Banner */}
        <Card className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-none shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMjBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          <div className="flex items-center justify-between relative z-10 p-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                <Scale className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">
                  Judge's Cases Overview
                </h3>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live sync from judicial bench
                </p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <p className="text-3xl font-bold text-white">{judgeStats.totalActive}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Cases</p>
              </div>
              <div className="text-center px-4 py-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-3xl font-bold text-amber-400">{judgeStats.pendingJudgment}</p>
                <p className="text-xs text-amber-400/70 uppercase tracking-wider font-medium">Pending Judgment</p>
              </div>
              <div className="text-center px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-3xl font-bold text-blue-400">{judgeStats.inProgress}</p>
                <p className="text-xs text-blue-400/70 uppercase tracking-wider font-medium">In Progress</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Assignments */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Pending Court Assignments
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {pendingAssignmentCases.length > 0 ? pendingAssignmentCases.map(c => <div key={c.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {c.id}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {c.type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-slate-900">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Filed {c.filed}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleAssignClick(c.id)}>
                        Assign to Court
                      </Button>
                    </div>) : <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                    <p>No cases pending assignment.</p>
                  </div>}
              </div>
            </Card>

            {/* Pending Registrations */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Pending Case Registrations
                </h3>
                <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Registration
                </Button>
              </div>
              <div className="space-y-4">
                {pendingRegistrationCases.length > 0 ? pendingRegistrationCases.map(c => <div key={c.id} className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="warning" className="text-[10px]">
                            Pending Approval
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {c.type}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-900">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Submitted: {c.filed}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleReviewClick(c.id)}>
                        Review
                      </Button>
                    </div>) : <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                <p>No pending registrations.</p>
                  </div>}
              </div>
            </Card>

            {/* Judge's Active Cases - Synced */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Gavel className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Judge's Active Cases
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Real-time judicial bench data
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
                    View All
                  </Button>

                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {judgeCases.slice(0, 5).map((c) =>
                <div
                  key={c.id}
                  className="p-4 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                  onClick={() =>
                  navigate(`/cases/${encodeURIComponent(c.id)}`)
                  }>

                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-12 rounded-full ${c.color} shadow-sm`}></div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                          {c.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {c.judge}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                      variant={
                      c.status === 'Pending Judgment' ?
                      'danger' :
                      c.status === 'In Progress' ?
                      'warning' :
                      'secondary'
                      }
                      className="text-[10px] font-semibold px-2.5 py-1 shadow-sm">

                        {c.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        <span className={c.daysLeft <= 3 ? 'text-red-600 font-semibold' : ''}>
                          {c.daysLeft}d
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {judgeCases.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No active judge cases found.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>


          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Hearings */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Upcoming Hearings
              </h3>
              <div className="space-y-4">
                {upcomingHearings.map(c => <div key={c.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 rounded-lg text-blue-700">
                      <span className="text-xs font-bold">
                        {new Date(c.nextHearing).getDate()}
                      </span>
                      <span className="text-[10px] uppercase">
                        {new Date(c.nextHearing).toLocaleString('default', {
                      month: 'short'
                    })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-1">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 mb-1">{c.id}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="text-[10px]">
                          {c.court || 'Unassigned'}
                        </Badge>
                        <button className="text-xs text-primary hover:underline" onClick={() => handleScheduleClick(c.id)}>
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>)}
                <Button variant="outline" className="w-full mt-2" size="sm" onClick={() => navigate('/calendar')}>
                  View Calendar
                </Button>

              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button className="w-full justify-start" size="sm" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Case
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/cases')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Registry
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/documents')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Process Documents
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <CreateCaseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {/* Assign Court Modal */}
      {showAssignModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Assign Case to Court</h3>
            <div className="space-y-4">
              <Select label="Select Court" value={assignCourt} onChange={e => setAssignCourt(e.target.value)} options={[{
            value: 'High Court 1',
            label: 'High Court 1'
          }, {
            value: 'High Court 2',
            label: 'High Court 2'
          }, {
            value: 'High Court 3',
            label: 'High Court 3'
          }, {
            value: 'Magistrate Court',
            label: 'Magistrate Court'
          }]} placeholder="Choose Court..." />
              <Select label="Assign Judge" value={assignJudge} onChange={e => setAssignJudge(e.target.value)} options={[{
            value: 'Hon. Justice Ibrahim',
            label: 'Hon. Justice Ibrahim'
          }, {
            value: 'Hon. Justice Sani',
            label: 'Hon. Justice Sani'
          }, {
            value: 'Hon. Justice Maryam',
            label: 'Hon. Justice Maryam'
          }]} placeholder="Choose Judge..." />
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </Button>
                <Button onClick={submitAssignment}>Assign Case</Button>
              </div>
            </div>
          </div>
        </div>}

      {/* Schedule Hearing Modal */}
      {showHearingModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Hearing</h3>
            <Input label="Hearing Date" type="date" value={hearingDate} onChange={e => setHearingDate(e.target.value)} />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowHearingModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitHearing}>Schedule</Button>
            </div>
          </div>
        </div>}

      {/* Review Registration Modal */}
      {showReviewModal && selectedCaseId && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Review Case Registration
            </h3>
            <div className="bg-slate-50 p-4 rounded-md mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Case ID:</strong> {selectedCaseId}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Title:</strong>{' '}
                {cases.find(c => c.id === selectedCaseId)?.title}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Type:</strong>{' '}
                {cases.find(c => c.id === selectedCaseId)?.type}
              </p>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Reviewing this case will approve it for filing and make it
              available for court assignment.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitApproval} className="bg-green-600 hover:bg-green-700">
                Approve & File
              </Button>
            </div>
          </div>
        </div>}
    </Layout>;
}
