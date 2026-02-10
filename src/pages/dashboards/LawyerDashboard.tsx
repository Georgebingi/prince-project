import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Briefcase,
  Calendar,
  FileText,
  Clock,
  Plus,
  Search,
  MessageSquare,
} from 'lucide-react';
import { useCases } from '../../contexts/CasesContext';
import { useAuth } from '../../contexts/AuthContext';
import { casesApi } from '../../services/api';
export function LawyerDashboard() {
  const navigate = useNavigate();
  const { cases } = useCases();
  const { user } = useAuth();
  // Filter cases assigned to the current lawyer
  const lawyerName = user?.name || 'Barrister Musa';
  const myCases = cases.filter((c) => {
    // Check if case is assigned to this lawyer
    if (c.lawyer === lawyerName) return true;
    if (c.lawyer === 'Barr. Musa' && lawyerName === 'Barrister Musa') return true;
    if (c.lawyer === 'Barrister Musa' && lawyerName === 'Barrister Musa') return true;

    return false;
  });
  const activeCases = myCases.slice(0, 5).map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    nextDate: c.nextHearing !== 'TBD' ? c.nextHearing : 'Not Scheduled'
  }));

  // Handle case assignment request
  const handleAssignCase = async (caseId: string) => {
    try {
      const response = await casesApi.requestCaseAssignment(caseId);
      if (response.success) {
        alert('Assignment request submitted successfully. A judge will review your request.');
        // Refresh cases to update the UI
        window.location.reload();
      } else {
        alert('Failed to submit assignment request. Please try again.');
      }
    } catch (error: any) {
      console.error('Assignment request error:', error);
      if (error.code === 'ALREADY_ASSIGNED') {
        alert('This case is already assigned to a lawyer.');
        // Refresh cases to update the UI
        window.location.reload();
      } else if (error.code === 'REQUEST_EXISTS') {
        alert('You already have a pending assignment request for this case.');
      } else if (error.status === 400) {
        alert('Unable to request assignment for this case. It may already be assigned.');
        // Refresh cases to update the UI
        window.location.reload();
      } else {
        alert('Failed to submit assignment request. Please check your connection and try again.');
      }
    }
  };

  const recentDocuments = [
  {
    name: 'Defense Motion.pdf',
    case: 'KDH/2024/001',
    date: '2 hours ago',
    status: 'Filed'
  },
  {
    name: 'Affidavit of Service.pdf',
    case: 'KDH/2024/022',
    date: 'Yesterday',
    status: 'Approved'
  },
  {
    name: 'Evidence Bundle A.zip',
    case: 'KDH/2024/051',
    date: 'Jan 12',
    status: 'Pending Review'
  }];

  return (
    <Layout title="Legal Practitioner Portal" showLogoBanner={false}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-blue-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Briefcase className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {lawyerName}
            </h2>
            <p className="text-blue-100 max-w-xl">
              You have {activeCases.length} active cases and 2 documents
              requiring your attention.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                className="bg-blue-50 text-blue-900 hover:bg-blue-50 border-none"
                onClick={() => navigate('/cases')}>

                <Plus className="h-4 w-4 mr-2" />
                File New Case
              </Button>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white/10"
                onClick={() => navigate('/cases')}>

                <Search className="h-4 w-4 mr-2" />
                Search Records
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Cases */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  My Active Cases
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/cases')}>

                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {/* Cases Section */}
                {activeCases.length > 0 ? (
                  <>
                    <h4 className="text-md font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <Briefcase className="h-4 w-4" />
                      Assigned Cases
                    </h4>
                    {activeCases.map((c) =>
                      <div
                        key={c.id}
                        className="group flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer"
                        onClick={() =>
                        navigate(`/cases/${encodeURIComponent(c.id)}`)
                        }>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {c.id}
                            </span>
                            <Badge variant="secondary">{c.status}</Badge>
                          </div>
                          <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {c.title}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-slate-600 gap-1 justify-end">
                            <Calendar className="h-4 w-4" />
                            <span>{c.nextDate}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            Next Hearing
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  (() => {
                    const unassignedCases = cases.filter(c => !c.lawyer && c.status !== 'Closed' && c.status !== 'Disposed').slice(0, 3);
                    return unassignedCases.length > 0 ? (
                      <>
                        {unassignedCases.map(c => (
                          <div key={c.id} className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
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

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <Button size="sm" onClick={() => handleAssignCase(c.id)} className="bg-amber-600 hover:bg-amber-700 text-white">
                                Request Assignment
                              </Button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No active cases assigned.</p>
                      </div>
                    );
                  })()
                )}
              </div>
            </Card>

            <Card className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Filings
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/documents')}>

                  Go to Repository
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">Document Name</th>
                      <th className="px-4 py-3">Case Ref</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDocuments.map((doc, idx) =>
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() =>
                      navigate(`/cases/${encodeURIComponent(doc.case)}`)
                      }>

                        <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          {doc.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{doc.case}</td>
                        <td className="px-4 py-3 text-slate-500">{doc.date}</td>
                        <td className="px-4 py-3">
                          <Badge
                          variant={
                          doc.status === 'Filed' ?
                          'success' :
                          doc.status === 'Approved' ?
                          'success' :
                          'warning'
                          }>

                            {doc.status}
                          </Badge>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Notifications
              </h3>
              <div className="space-y-4">
                <div
                  className="flex gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                  onClick={() =>
                  navigate(`/cases/${encodeURIComponent('KDH/2024/001')}`)
                  }>

                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">
                      Registrar commented on{' '}
                      <span className="font-medium">Case #001</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">10 mins ago</p>
                  </div>
                </div>
                <div
                  className="flex gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                  onClick={() =>
                  navigate(`/cases/${encodeURIComponent('KDH/2024/051')}`)
                  }>

                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">
                      Hearing rescheduled for{' '}
                      <span className="font-medium">Case #051</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900 text-white border-none">
              <h3 className="text-lg font-semibold mb-2">
                Court Announcements
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                The High Court will be on recess from Dec 20th to Jan 5th.
                Emergency motions only.
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                Read Circular
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>);

}