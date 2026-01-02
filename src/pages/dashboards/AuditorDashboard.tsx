import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { ShieldCheck, FileSearch, AlertOctagon, Users, Download, Filter, Calendar, Eye } from 'lucide-react';
export function AuditorDashboard() {
  return <Layout title="Compliance Audit Log">
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
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="primary" className="flex items-center gap-2">
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
                  12,458
                </h3>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <ActivityIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Users
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">842</h3>
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
                <h3 className="text-2xl font-bold text-slate-900 mt-1">3</h3>
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
                  99.8%
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
                <Input placeholder="Filter by user or action..." className="pl-9" />
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
            }]} value="all" onChange={() => {}} label="" />
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
            }]} value="all" onChange={() => {}} label="" />
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input type="date" className="pl-9" />
              </div>
            </div>
            <Button variant="secondary">Apply Filters</Button>
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
                {[{
                time: '2023-10-24 14:32:11',
                user: 'Hon. Sarah Jenkins',
                role: 'Judge',
                action: 'Update Case',
                resource: 'CASE-2023-001',
                details: 'Added ruling notes'
              }, {
                time: '2023-10-24 14:28:45',
                user: 'David Chen',
                role: 'Clerk',
                action: 'Upload Document',
                resource: 'DOC-8821',
                details: 'Evidence submission'
              }, {
                time: '2023-10-24 14:15:22',
                user: 'System Admin',
                role: 'IT Admin',
                action: 'User Login',
                resource: 'AUTH',
                details: 'Successful login from 192.168.1.1'
              }, {
                time: '2023-10-24 13:55:01',
                user: 'Elena Rodriguez',
                role: 'Registrar',
                action: 'Create Case',
                resource: 'CASE-2023-042',
                details: 'New filing registration'
              }, {
                time: '2023-10-24 13:42:18',
                user: 'James Wright',
                role: 'Lawyer',
                action: 'View Document',
                resource: 'DOC-8819',
                details: 'Access granted'
              }, {
                time: '2023-10-24 13:30:05',
                user: 'Hon. Michael Ross',
                role: 'Judge',
                action: 'Assign Hearing',
                resource: 'SCHED-112',
                details: 'Date set for Nov 12'
              }, {
                time: '2023-10-24 13:15:44',
                user: 'System',
                role: 'System',
                action: 'Backup',
                resource: 'DB-MAIN',
                details: 'Automated hourly backup'
              }, {
                time: '2023-10-24 12:58:33',
                user: 'David Chen',
                role: 'Clerk',
                action: 'Update Status',
                resource: 'CASE-2023-001',
                details: 'Changed to In Progress'
              }].map((log, i) => <tr key={i} className="hover:bg-slate-50">
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
                  </tr>)}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Showing 1-8 of 12,458 records
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>;
}
function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>;
}