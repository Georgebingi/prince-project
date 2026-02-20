import { useState, useMemo, useEffect, useCallback } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { ShieldCheck, Users, Activity, Eye, Download, FileSearch, AlertOctagon, Filter, Calendar } from 'lucide-react';
import { auditLogsApi } from '../../services/api';

interface AuditLog {
  time: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  details: string;
  status: 'Success' | 'Failed';
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
  user_role: string | null;
}

export default function AuditorDashboard() {

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch audit logs from backend
  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await auditLogsApi.getAuditLogs({
        limit: 50,
        page: currentPage
      });
      
      if (response.success && response.data) {
        const backendLogs = response.data as BackendAuditLog[];
        const mappedLogs: AuditLog[] = backendLogs.map((log) => ({
          time: new Date(log.timestamp).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(',', ''),
          user: log.user_name || `User ${log.user_id}` || 'Unknown',
          role: log.user_role ? log.user_role.charAt(0).toUpperCase() + log.user_role.slice(1).toLowerCase() : 'Unknown',
          action: log.action,
          resource: log.resource + (log.resource_id ? ` #${log.resource_id}` : ''),
          details: log.details ? JSON.stringify(log.details) : `Action on ${log.resource}`,
          status: log.action.toLowerCase().includes('fail') || log.action.toLowerCase().includes('error') 
            ? 'Failed' 
            : 'Success'
        }));
        setLogs(mappedLogs);
        setTotalLogs(response.pagination?.total || mappedLogs.length);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setLogs([]);
        setTotalLogs(0);
      }
    } catch (err) {
      setLogs([]);
    }
  }, [currentPage]);

  // Fetch logs on mount and when page changes
  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, fetchAuditLogs]);

  // Dynamic stats calculated from real data
  const stats = useMemo(() => {
    const totalActions = totalLogs;
    const activeUsers = new Set(logs.map(log => log.user)).size;
    const criticalEvents = logs.filter(log =>
      log.action.toLowerCase().includes('delete') || log.status === 'Failed'
    ).length;
    
    // Calculate compliance score based on success/failure ratio
    const successCount = logs.filter(log => log.status === 'Success').length;
    const totalCount = logs.length;
    const complianceScore = totalCount > 0 
      ? Math.round((successCount / totalCount) * 100 * 10) / 10 
      : 100;

    return { totalActions, activeUsers, criticalEvents, complianceScore };
  }, [logs, totalLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = search === '' ||
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.resource.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === 'all' || log.role.toLowerCase() === roleFilter;
      const matchesAction = actionFilter === 'all' ||
        log.action.toLowerCase().includes(actionFilter.toLowerCase().replace(' ', ''));

      const matchesDate = dateFilter === '' || log.time.startsWith(dateFilter);

      return matchesSearch && matchesRole && matchesAction && matchesDate;
    });
  }, [logs, search, roleFilter, actionFilter, dateFilter]);

  const handleApplyFilters = () => {
    fetchAuditLogs();
  };

  const handleExportCSV = () => {
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Details'],
      ...filteredLogs.map(log => [
        log.time,
        log.user,
        log.role,
        log.action,
        log.resource,
        log.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    window.print();
  };
  return <Layout title="Compliance Audit Log" showLogoBanner={false}>
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <Eye className="h-5 w-5 text-amber-600" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Read-Only Access Mode
            </h3>
            <p className="text-xs text-amber-700">
              You are viewing the system in audit mode. No changes can be made
              to case files or user data.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-500">
              System-wide activity tracking and compliance monitoring
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="primary" className="flex items-center gap-2" onClick={handleGenerateReport}>
              <FileSearch className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Audit Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Actions (24h)
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.totalActions.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Users
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.activeUsers}</h3>
              </div>
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Critical Events
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.criticalEvents}</h3>
              </div>
              <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertOctagon className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Compliance Score
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.complianceScore}%
                </h3>
              </div>
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Audit Trail Section */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Filter by user or action..."
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select options={[{
              value: 'all',
              label: 'All Roles'
            }, {
              value: 'judge',
              label: 'Judge'
            }, {
              value: 'lawyer',
              label: 'Lawyer'
            }, {
              value: 'clerk',
              label: 'Clerk'
            }, {
              value: 'admin',
              label: 'Admin'
            }]} value={roleFilter} onChange={e => setRoleFilter(e.target.value)} label="Role" />
              <Select options={[{
              value: 'all',
              label: 'All Action Types'
            }, {
              value: 'create',
              label: 'Creation'
            }, {
              value: 'update',
              label: 'Update'
            }, {
              value: 'delete',
              label: 'Deletion'
            }, {
              value: 'access',
              label: 'Access'
            }]} value={actionFilter} onChange={e => setActionFilter(e.target.value)} label="Action Type" />
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  className="pl-9"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                />
              </div>
            </div>
<Button variant="secondary" onClick={handleApplyFilters}>Apply Filters</Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Resource</th>
                  <th className="px-6 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredLogs.length > 0 ? filteredLogs.map((log, i) => <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                      {log.time}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="text-xs">
                        {log.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{log.action}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>) : <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No audit logs found matching your filters.
                  </td>
                </tr>}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * 50) + 1}-{Math.min(currentPage * 50, totalLogs)} of {totalLogs.toLocaleString()} records
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>;
}
