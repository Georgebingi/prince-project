import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Server, Users, Activity, Database, Shield, Settings, Search, RefreshCw, HardDrive } from 'lucide-react';
export function ITAdminDashboard() {
  return <Layout title="System Control Center">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-500">
              Infrastructure monitoring and user management
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>
            <Button variant="primary" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Config
            </Button>
          </div>
        </div>

        {/* System Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  System Uptime
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  99.99%
                </h3>
              </div>
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="success">Operational</Badge>
              <span className="text-slate-500 ml-2">Last outage: 42d ago</span>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Users
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">842</h3>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-slate-500">Peak today: 915 users</span>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Storage Used
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  4.2 TB
                </h3>
              </div>
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="w-full bg-slate-100 rounded-full h-1.5 mr-2 max-w-[100px]">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{
                width: '65%'
              }}></div>
              </div>
              <span className="text-slate-500">65% of 6.5TB</span>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  API Latency
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">45ms</h3>
              </div>
              <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Server className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="success">Healthy</Badge>
              <span className="text-slate-500 ml-2">Avg: 48ms</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Management Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  User Management
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search users..." className="pl-9" />
                  </div>
                  <Button variant="primary">Add User</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Pending Approvals
                </h4>
                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">
                          Requested Role
                        </th>
                        <th className="px-4 py-3 font-medium">Department</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[{
                      name: 'Sarah Connor',
                      email: 's.connor@court.gov',
                      role: 'Clerk',
                      dept: 'Civil'
                    }, {
                      name: 'James Wright',
                      email: 'j.wright@law.com',
                      role: 'Lawyer',
                      dept: 'External'
                    }, {
                      name: 'Emily Chen',
                      email: 'e.chen@court.gov',
                      role: 'Registrar',
                      dept: 'Family'
                    }].map((user, i) => <tr key={i} className="bg-white">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">{user.role}</Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {user.dept}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                Reject
                              </Button>
                              <Button size="sm" variant="primary">
                                Approve
                              </Button>
                            </div>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                System Activity Log
              </h3>
              <div className="space-y-4">
                {[{
                action: 'User Permissions Updated',
                user: 'Admin User',
                target: 'John Doe',
                time: '10 mins ago',
                type: 'info'
              }, {
                action: 'Failed Login Attempt',
                user: 'Unknown IP',
                target: 'System',
                time: '25 mins ago',
                type: 'warning'
              }, {
                action: 'Database Backup Completed',
                user: 'System',
                target: 'Primary DB',
                time: '1 hour ago',
                type: 'success'
              }, {
                action: 'New Role Created',
                user: 'Admin User',
                target: 'Senior Clerk',
                time: '2 hours ago',
                type: 'info'
              }].map((log, i) => <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className={`mt-1 p-1.5 rounded-full ${log.type === 'warning' ? 'bg-amber-100 text-amber-600' : log.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {log.type === 'warning' ? <Shield className="h-3 w-3" /> : log.type === 'success' ? <Database className="h-3 w-3" /> : <Settings className="h-3 w-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {log.action}
                        </p>
                        <span className="text-xs text-slate-400">
                          {log.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        By <span className="font-medium">{log.user}</span> •
                        Target: {log.target}
                      </p>
                    </div>
                  </div>)}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Audit Logs
              </Button>
            </Card>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Role Distribution
              </h3>
              <div className="space-y-4">
                {[{
                label: 'Lawyers',
                count: 450,
                color: 'bg-blue-500'
              }, {
                label: 'Judges',
                count: 45,
                color: 'bg-purple-500'
              }, {
                label: 'Clerks',
                count: 120,
                color: 'bg-green-500'
              }, {
                label: 'Registrars',
                count: 25,
                color: 'bg-orange-500'
              }, {
                label: 'Partners',
                count: 202,
                color: 'bg-slate-500'
              }].map((item, i) => <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-medium text-slate-900">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{
                    width: `${item.count / 842 * 100}%`
                  }}></div>
                    </div>
                  </div>)}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Permissions
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Backup Data Now
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Services
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-slate-900 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-semibold text-sm">System Status</h3>
              </div>
              <p className="text-slate-400 text-xs mb-4">
                All systems operational. Next scheduled maintenance window:
                Sunday 02:00 AM EST.
              </p>
              <div className="text-xs font-mono text-slate-500">
                v2.4.1-stable
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>;
}