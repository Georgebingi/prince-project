import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  Download,
  Filter,
  Search,
  RefreshCw,
  ShieldAlert,
  FolderOpen,
  ChevronRight,
  User
} from 'lucide-react';
import { UserPerformanceStats } from '../components/UserPerformanceStats';
import { useCases } from '../contexts/CasesContext';
import { auditLogsApi, ApiError } from '../services/api';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Warning';
  ip: string;
}

interface BackendAuditLog {
  id: number;
  timestamp: string;
  user_id: number | null;
  user_name: string | null;
  action: string;
  resource: string;
  resource_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown> | null;
}

export function AuditLogPage() {
  const navigate = useNavigate();
  const { cases } = useCases();
  const [activeTab, setActiveTab] = useState<'logs' | 'cases'>('logs');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // Cases tab state
  const [caseSearch, setCaseSearch] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');
  const [caseStatusFilter, setCaseStatusFilter] = useState('all');
  // Audit logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLogs, setTotalLogs] = useState(0);

  // Fetch audit logs from backend
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await auditLogsApi.getAuditLogs({
        user: filterUser || undefined,
        action: filterAction || undefined,
        limit: 100
      });
      
      if (response.success && response.data) {
        const backendLogs = response.data as BackendAuditLog[];
        const mappedLogs: AuditLog[] = backendLogs.map((log) => ({
          id: `LOG-${log.id}`,
          user: log.user_name || `User ${log.user_id}` || 'Unknown',
          action: log.action,
          resource: log.resource + (log.resource_id ? ` #${log.resource_id}` : ''),
          timestamp: new Date(log.timestamp).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(',', ''),
          status: log.action.toLowerCase().includes('fail') || log.action.toLowerCase().includes('error') 
            ? 'Failed' 
            : 'Success',
          ip: log.ip_address || 'N/A'
        }));
        setLogs(mappedLogs);
        setTotalLogs(response.pagination?.total || mappedLogs.length);
      } else {
        setLogs([]);
        setTotalLogs(0);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load audit logs';
      setError(message);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterUser, filterAction]);

  // Fetch logs on mount and when filters change
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesUser =
        filterUser === '' ||
        log.user.toLowerCase().includes(filterUser.toLowerCase());
      const matchesAction =
        filterAction === '' ||
        log.action.toLowerCase().includes(filterAction.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'success' && log.status === 'Success') ||
        (filterStatus === 'failed' && log.status === 'Failed') ||
        (filterStatus === 'warning' && log.status === 'Warning');
      return matchesUser && matchesAction && matchesStatus;
    });
  }, [logs, filterUser, filterAction, filterStatus]);

  // Filter cases for the Cases tab
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
      caseSearch === '' ||
      c.title.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.judge && c.judge.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.lawyer && c.lawyer.toLowerCase().includes(caseSearch.toLowerCase());
      const matchesType =
      caseTypeFilter === 'all' || c.type.toLowerCase() === caseTypeFilter;
      const matchesStatus =
      caseStatusFilter === 'all' ||
      c.status.toLowerCase().includes(caseStatusFilter);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [cases, caseSearch, caseTypeFilter, caseStatusFilter]);
  const handleExportPDF = () => {
    window.print();
  };
  const handleApplyFilters = () => {
    fetchAuditLogs();
  };

  const handleClearFilters = () => {
    setFilterUser('');
    setFilterAction('');
    setFilterStatus('all');
    fetchAuditLogs();
  };

  const getPartyCategoryLabel = (category?: string) => {
    const map: Record<string, string> = {
      'govt-vs-govt': 'Govt vs Govt',
      'govt-vs-public': 'Govt vs Public',
      'public-vs-govt': 'Public vs Govt',
      'public-vs-public': 'Public vs Public'
    };
    return category ? map[category] || '' : '';
  };
  return (
    <Layout title="Audit Logs & Compliance" showLogoBanner={false}>
      <div className="space-y-6">
        {/* Performance Stats Section */}
        <div className="print:break-inside-avoid">
          <UserPerformanceStats />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 print:hidden">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${activeTab === 'logs' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}>

              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Activity Logs
              </div>
              {activeTab === 'logs' &&
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
              }
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${activeTab === 'cases' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}>

              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                All Cases
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {cases.length}
                </span>
              </div>
              {activeTab === 'cases' &&
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
              }
            </button>
          </div>
        </div>

        {/* Activity Logs Tab */}
        {activeTab === 'logs' &&
        <>
            {/* Filters Card */}
            <div className="print:hidden">
              <Card>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <Input
                    label="Search User"
                    placeholder="e.g. Ibrahim"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)} />

                  </div>
                  <div className="flex-1 w-full">
                    <Input
                    label="Search Action"
                    placeholder="e.g. Login, Upload"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)} />

                  </div>
                  <div className="flex-1 w-full">
                    <Select
                    label="Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    options={[
                    {
                      value: 'all',
                      label: 'All Statuses'
                    },
                    {
                      value: 'success',
                      label: 'Success'
                    },
                    {
                      value: 'failed',
                      label: 'Failed'
                    },
                    {
                      value: 'warning',
                      label: 'Warning'
                    }]
                    }
                    placeholder="Select Status" />

                  </div>
                  <div className="flex gap-2">
                    <Button
                    variant="outline"
                    onClick={handleClearFilters}>

                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleApplyFilters}>
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>

                </div>
              </Card>
            </div>

            {/* Logs Table */}
            <Card noPadding>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-slate-500" />
                  <h3 className="font-semibold text-slate-900">
                    System Activity Log
                  </h3>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report (PDF)
                </Button>
              </div>

              <div className="hidden print:block p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">
                  System Activity Log Report
                </h2>
                <p className="text-sm text-slate-500">
                  Generated on {new Date().toLocaleString()}
                </p>
              </div>

              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button variant="outline" onClick={fetchAuditLogs}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Resource</th>
                      <th className="px-6 py-3">IP Address</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.length > 0 ?
                  filteredLogs.map((log) =>
                  <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            {log.timestamp}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {log.user}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            {log.ip}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                        variant={
                        log.status === 'Success' ?
                        'success' :
                        log.status === 'Failed' ?
                        'danger' :
                        'warning'
                        }>

                              {log.status}
                            </Badge>
                          </td>
                        </tr>
                  ) :

                  <tr>
                        <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500">

                          No logs found matching your filters.
                        </td>
                      </tr>
                  }
                  </tbody>
                </table>
              </div>
              )}


              <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between print:hidden">
                <span>Showing {filteredLogs.length} of {totalLogs} events</span>
                <span>
                  Audit logs are retained for 7 years per compliance policy.
                </span>
              </div>

            </Card>
          </>
        }

        {/* All Cases Tab */}
        {activeTab === 'cases' &&
        <>
            {/* Cases Search & Filters */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full relative">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Search Cases
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                    type="text"
                    placeholder="Search by case ID, title, judge, or lawyer..."
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />

                  </div>
                </div>
                <div className="w-full md:w-40">
                  <Select
                  label="Case Type"
                  value={caseTypeFilter}
                  onChange={(e) => setCaseTypeFilter(e.target.value)}
                  options={[
                  {
                    value: 'all',
                    label: 'All Types'
                  },
                  {
                    value: 'criminal',
                    label: 'Criminal'
                  },
                  {
                    value: 'civil',
                    label: 'Civil'
                  },
                  {
                    value: 'family',
                    label: 'Family'
                  },
                  {
                    value: 'commercial',
                    label: 'Commercial'
                  },
                  {
                    value: 'appeal',
                    label: 'Appeal'
                  }]
                  } />

                </div>
                <div className="w-full md:w-40">
                  <Select
                  label="Status"
                  value={caseStatusFilter}
                  onChange={(e) => setCaseStatusFilter(e.target.value)}
                  options={[
                  {
                    value: 'all',
                    label: 'All Statuses'
                  },
                  {
                    value: 'filed',
                    label: 'Filed'
                  },
                  {
                    value: 'progress',
                    label: 'In Progress'
                  },
                  {
                    value: 'pending',
                    label: 'Pending'
                  },
                  {
                    value: 'review',
                    label: 'Review'
                  },
                  {
                    value: 'closed',
                    label: 'Closed'
                  }]
                  } />

                </div>
                <Button
                variant="outline"
                onClick={() => {
                  setCaseSearch('');
                  setCaseTypeFilter('all');
                  setCaseStatusFilter('all');
                }}>

                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Cases Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {cases.length}
                  </p>
                  <p className="text-xs text-slate-500">Total Cases</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {
                  cases.filter(
                    (c) =>
                    c.status === 'In Progress' || c.status === 'Filed'
                  ).length
                  }
                  </p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {
                  cases.filter(
                    (c) =>
                    c.status === 'Pending Judgment' ||
                    c.status === 'Pending Approval'
                  ).length
                  }
                  </p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-400">
                    {
                  cases.filter(
                    (c) => c.status === 'Closed' || c.status === 'Disposed'
                  ).length
                  }
                  </p>
                  <p className="text-xs text-slate-500">Closed</p>
                </div>
              </Card>
            </div>

            {/* Cases Table */}
            <Card noPadding>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-slate-500" />
                  <h3 className="font-semibold text-slate-900">
                    All System Cases
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {filteredCases.length} of {cases.length}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Case Details</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Party</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Judge</th>
                      <th className="px-4 py-3">Lawyer</th>
                      <th className="px-4 py-3">Filed</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases.length > 0 ?
                  filteredCases.map((c) =>
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    onClick={() =>
                    navigate(`/cases/${encodeURIComponent(c.id)}`)
                    }>

                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <div
                          className={`w-1 h-10 rounded-full ${c.color} flex-shrink-0 mt-0.5`}>
                        </div>
                              <div>
                                <p className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                                  {c.title}
                                </p>
                                <p className="text-xs text-slate-500 font-mono">
                                  {c.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-[10px]">
                              {c.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {c.partyCategory ?
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 whitespace-nowrap">
                                {getPartyCategoryLabel(c.partyCategory)}
                              </span> :

                      <span className="text-xs text-slate-400">—</span>
                      }
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                        variant={
                        c.status === 'In Progress' ?
                        'warning' :
                        c.status === 'Pending Judgment' ?
                        'danger' :
                        c.status === 'Closed' ||
                        c.status === 'Disposed' ?
                        'secondary' :
                        'secondary'
                        }
                        className="text-[10px]">

                              {c.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {c.judge ?
                      <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-700 whitespace-nowrap">
                                  {c.judge}
                                </span>
                              </div> :

                      <span className="text-xs text-slate-400">
                                Unassigned
                              </span>
                      }
                          </td>
                          <td className="px-4 py-3">
                            {c.lawyer ?
                      <span className="text-xs text-slate-700 whitespace-nowrap">
                                {c.lawyer}
                              </span> :

                      <span className="text-xs text-slate-400">—</span>
                      }
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {c.filed}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors inline-block" />
                          </td>
                        </tr>
                  ) :

                  <tr>
                        <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-slate-500">

                          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                          <p className="font-medium">No cases found</p>
                          <p className="text-xs mt-1">
                            Try adjusting your search or filters.
                          </p>
                        </td>
                      </tr>
                  }
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>
                  Showing {filteredCases.length} of {cases.length} cases
                </span>
                <span>Click any case to view details</span>
              </div>
            </Card>
          </>
        }
      </div>
    </Layout>);

}
