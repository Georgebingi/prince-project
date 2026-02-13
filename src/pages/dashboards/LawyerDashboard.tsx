import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Briefcase,
  Calendar,
  FileText,
  Plus,
  Search,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { useCases, Case } from '../../contexts/CasesContext';
import { useAuth } from '../../contexts/AuthContext';
import { casesApi, documentsApi, notificationsApi } from '../../services/api';
export function LawyerDashboard() {
  const navigate = useNavigate();
  const { cases, refresh } = useCases();
  const { user } = useAuth();

  // State for documents and notifications
  const [documents, setDocuments] = useState<Array<{id: number; name: string; case_id: string; case_number?: string; uploaded_at: string; status: string; type: string}>>([]);
  const [notifications, setNotifications] = useState<Array<{id: number; title: string; message: string; created_at: string; related_resource_id: string; related_resource_type?: string}>>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  // Fetch documents and notifications from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDocs(true);
      setIsLoadingNotifs(true);
      
      try {
        // Fetch documents for this lawyer's cases using lawyerId
        const docsResponse = await documentsApi.getDocuments({ 
          limit: 10,
          lawyerId: user?.id ? String(user.id) : undefined 
        });
        if (docsResponse.success && docsResponse.data && Array.isArray(docsResponse.data)) {
          setDocuments(docsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoadingDocs(false);
      }

      try {
        // Fetch notifications for this user
        const notifsResponse = await notificationsApi.getNotifications({ limit: 10 });
        if (notifsResponse.success && notifsResponse.data && Array.isArray(notifsResponse.data)) {
          setNotifications(notifsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoadingNotifs(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Filter cases assigned to the current lawyer
  // Use user's actual name, with a fallback based on role
  const lawyerName = user?.name || (user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : 'Legal Practitioner');
  const myCases = cases.filter((c: Case) => {
    // Check if case is assigned to this lawyer by name
    if (c.lawyer === lawyerName) return true;
    // Also check if case has no assigned lawyer
    if (!c.lawyer) return false;
    // Check if the lawyer name matches partially
    if (user?.name && c.lawyer.toLowerCase().includes(user.name.toLowerCase())) return true;

    return false;
  });
  const activeCases = myCases.slice(0, 5).map((c: Case) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    nextDate: c.nextHearing !== 'TBD' ? c.nextHearing : 'Not Scheduled'
  }));

  // Calculate documents needing attention
  const documentsNeedingAttention = documents.filter(d => d.status === 'pending').length;

  // Handle case assignment request
  const handleAssignCase = async (caseId: string) => {
    try {
      const response = await casesApi.requestCaseAssignment(caseId);
      if (response.success) {
        alert('Assignment request submitted successfully. A judge will review your request.');
        // Refresh cases to update the UI immediately
        await refresh();
      } else {
        alert('Failed to submit assignment request. Please try again.');
      }
  } catch (error: unknown) {
    console.error('Assignment request error:', error);
    const err = error as { code?: string; status?: number };
    if (err.code === 'ALREADY_ASSIGNED') {
      alert('This case is already assigned to a lawyer.');
      // Refresh cases to update the UI immediately
      await refresh();
    } else if (err.code === 'REQUEST_EXISTS') {
      alert('You already have a pending assignment request for this case.');
    } else if (err.status === 400) {
      alert('Unable to request assignment for this case. It may already be assigned.');
      // Refresh cases to update the UI immediately
      await refresh();
    } else {
      alert('Failed to submit assignment request. Please check your connection and try again.');
    }
  }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

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
              You have {activeCases.length} active cases and {documentsNeedingAttention} document{documentsNeedingAttention !== 1 ? 's' : ''}
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
                    {isLoadingDocs ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2">Loading documents...</p>
                        </td>
                      </tr>
                    ) : documents.length > 0 ? (
                      documents.slice(0, 5).map((doc: {id: number; name: string; case_id: string; case_number?: string; uploaded_at: string; status: string}, idx: number) =>
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                        onClick={() =>
                        navigate(`/cases/${encodeURIComponent(doc.case_number || doc.case_id)}`)
                        }>

                          <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            {doc.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{doc.case_number || doc.case_id}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(doc.uploaded_at)}</td>
                          <td className="px-4 py-3">
                            <Badge
                            variant={
                            doc.status === 'approved' ?
                            'success' :
                            doc.status === 'pending' ?
                            'warning' :
                            'secondary'
                            }>

                              {doc.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No recent documents found
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
                {isLoadingNotifs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                      onClick={() => {
                        if (notification.related_resource_type === 'case' && notification.related_resource_id) {
                          navigate(`/cases/${encodeURIComponent(notification.related_resource_id)}`);
                        }
                      }}
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-500">
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-slate-900 text-white border-none">
              <h3 className="text-lg font-semibold mb-2">
                Court Announcements
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                No current announcements. Check back later for updates from the Court.
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                View Archives
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>);

}