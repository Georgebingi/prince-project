import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Download, Filter, Search, RefreshCw, ShieldAlert } from 'lucide-react';
interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Warning';
  ip: string;
}
export function AuditLogPage() {
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
<<<<<<< HEAD
  const [logs, setLogs] = useState<AuditLog[]>([
  {
=======
  const [logs, setLogs] = useState<AuditLog[]>([{
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    id: 'LOG-001',
    user: 'Hon. Justice Ibrahim',
    action: 'Viewed Case Details',
    resource: 'Case #KDH/2024/001',
    timestamp: '2024-01-20 10:30:45',
    status: 'Success',
    ip: '192.168.1.10'
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    id: 'LOG-002',
    user: 'Registrar Bello',
    action: 'Uploaded Document',
    resource: 'Affidavit.pdf',
    timestamp: '2024-01-20 10:15:22',
    status: 'Success',
    ip: '192.168.1.15'
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    id: 'LOG-003',
    user: 'System Admin',
    action: 'Failed Login Attempt',
    resource: 'Admin Portal',
    timestamp: '2024-01-20 09:45:00',
    status: 'Failed',
    ip: '203.0.113.42'
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    id: 'LOG-004',
    user: 'Clerk Amina',
    action: 'Updated Case Status',
    resource: 'Case #KDH/2024/022',
    timestamp: '2024-01-20 09:30:11',
    status: 'Success',
    ip: '192.168.1.20'
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    id: 'LOG-005',
    user: 'Barrister Musa',
    action: 'Filed Motion',
    resource: 'Motion for Bail',
    timestamp: '2024-01-19 16:20:33',
    status: 'Success',
    ip: '10.0.0.5'
<<<<<<< HEAD
  }]
  );
  const filteredLogs = logs.filter((log) => {
    const matchesUser =
    filterUser === '' ||
    log.user.toLowerCase().includes(filterUser.toLowerCase());
    const matchesAction =
    filterAction === '' ||
    log.action.toLowerCase().includes(filterAction.toLowerCase());
=======
  }]);
  const filteredLogs = logs.filter(log => {
    const matchesUser = filterUser === '' || log.user.toLowerCase().includes(filterUser.toLowerCase());
    const matchesAction = filterAction === '' || log.action.toLowerCase().includes(filterAction.toLowerCase());
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    return matchesUser && matchesAction;
  });
  const handleExportPDF = () => {
    window.print();
  };
  const handleApplyFilters = () => {
    // In a real app, this might trigger a backend query
    // Here, the filtering is already reactive, but we can show a feedback
    alert(`Filters applied! Showing ${filteredLogs.length} results.`);
  };
<<<<<<< HEAD
  return (
    <Layout title="Audit Logs & Compliance">
=======
  return <Layout title="Audit Logs & Compliance">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
      <div className="space-y-6">
        {/* Filters Card - Hide in print */}
        <div className="print:hidden">
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
<<<<<<< HEAD
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
                  onClick={() => {
                    setFilterUser('');
                    setFilterAction('');
                  }}>

=======
                <Input label="Search User" placeholder="e.g. Ibrahim" value={filterUser} onChange={e => setFilterUser(e.target.value)} />
              </div>
              <div className="flex-1 w-full">
                <Input label="Search Action" placeholder="e.g. Login, Upload" value={filterAction} onChange={e => setFilterAction(e.target.value)} />
              </div>
              <div className="flex-1 w-full">
                <Select label="Status" options={[{
                value: 'all',
                label: 'All Statuses'
              }, {
                value: 'success',
                label: 'Success'
              }, {
                value: 'failed',
                label: 'Failed'
              }, {
                value: 'warning',
                label: 'Warning'
              }]} placeholder="Select Status" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                setFilterUser('');
                setFilterAction('');
              }}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
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

          {/* Print Header */}
          <div className="hidden print:block p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              System Activity Log Report
            </h2>
            <p className="text-sm text-slate-500">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>

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
<<<<<<< HEAD
                {filteredLogs.length > 0 ?
                filteredLogs.map((log) =>
                <tr key={log.id} className="hover:bg-slate-50">
=======
                {filteredLogs.length > 0 ? filteredLogs.map(log => <tr key={log.id} className="hover:bg-slate-50">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {log.user}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{log.action}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {log.ip}
                      </td>
                      <td className="px-6 py-4">
<<<<<<< HEAD
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
=======
                        <Badge variant={log.status === 'Success' ? 'success' : log.status === 'Failed' ? 'danger' : 'warning'}>
                          {log.status}
                        </Badge>
                      </td>
                    </tr>) : <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No logs found matching your filters.
                    </td>
                  </tr>}
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between print:hidden">
            <span>Showing {filteredLogs.length} events</span>
            <span>
              Audit logs are retained for 7 years per compliance policy.
            </span>
          </div>
        </Card>
      </div>
<<<<<<< HEAD
    </Layout>);

=======
    </Layout>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}