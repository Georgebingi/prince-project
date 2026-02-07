import './CourtAdminDashboard.css';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BarChart3, Users, FileText, AlertTriangle, TrendingUp, Download, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function CourtAdminDashboard() {
  return <Layout title="Executive Overview" showLogoBanner={false}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-500">
              Court performance metrics and operational insights
            </p>
          </div>
          <div className="flex gap-3">  
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="primary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Active Cases
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  2,845
                </h3>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center font-medium">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                12%
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Case Clearance Rate
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  94.2%
                </h3>
              </div>
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center font-medium">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                2.4%
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Avg. Disposition Time
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  45 Days
                </h3>
              </div>
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center font-medium">
                <ArrowDownRight className="h-4 w-4 mr-1" />3 days
              </span>
              <span className="text-slate-500 ml-2">faster than avg</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Staff
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">142</h3>
              </div>
              <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-slate-500">98% attendance today</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analytics Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Case Volume Analytics
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Weekly
                  </Button>
                  <Button variant="secondary" size="sm">
                    Monthly
                  </Button>
                  <Button variant="outline" size="sm">
                    Yearly
                  </Button>
                </div>
              </div>

              {/* Mock Chart Visualization */}
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {[65, 45, 75, 55, 85, 70, 90, 60, 75, 50, 80, 95].map((height, i) => <div key={i} className="w-full bg-blue-50 rounded-t-sm relative group" data-bar-height={height}>
                      <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-600"></div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                      </div>
                    </div>)}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Staff Performance Summary
                </h3>
                <Button variant="outline" size="sm">
                  View All Staff
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Staff Member</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Cases Assigned</th>
                      <th className="px-4 py-3 font-medium">Clearance Rate</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[{
                    name: 'Hon. Sarah Jenkins',
                    role: 'Judge',
                    cases: 45,
                    rate: '92%',
                    status: 'Active'
                  }, {
                    name: 'Hon. Michael Ross',
                    role: 'Judge',
                    cases: 38,
                    rate: '88%',
                    status: 'In Hearing'
                  }, {
                    name: 'Elena Rodriguez',
                    role: 'Registrar',
                    cases: 124,
                    rate: '98%',
                    status: 'Active'
                  }, {
                    name: 'David Chen',
                    role: 'Clerk',
                    cases: 89,
                    rate: '95%',
                    status: 'On Leave'
                  }].map((staff, i) => <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {staff.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {staff.role}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {staff.cases}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" data-rate={parseInt(staff.rate, 10)}></div>
                            </div>
                            {staff.rate}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={staff.status === 'Active' ? 'success' : staff.status === 'In Hearing' ? 'warning' : 'secondary'}>
                            {staff.status}
                          </Badge>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                System Alerts
              </h3>
              <div className="space-y-4">
                {[{
                title: 'High Case Volume',
                desc: 'Family court experiencing 20% surge',
                type: 'warning',
                time: '2h ago'
              }, {
                title: 'System Maintenance',
                desc: 'Scheduled for tonight 2:00 AM',
                type: 'info',
                time: '4h ago'
              }, {
                title: 'Staff Shortage',
                desc: '3 clerks on leave in Civil Division',
                type: 'error',
                time: '1d ago'
              }].map((alert, i) => <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className={`mt-0.5 ${alert.type === 'warning' ? 'text-amber-500' : alert.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {alert.desc}
                      </p>
                      <span className="text-xs text-slate-400 mt-1 block">
                        {alert.time}
                      </span>
                    </div>
                  </div>)}
              </div>
              <Button variant="outline" className="w-full mt-4 text-sm">
                View All Alerts
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-start">
                  <PieChart className="h-4 w-4 mr-2" />
                  View Department Analytics
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Staff Roster
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Review Pending Reports
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-blue-600 text-white">
              <h3 className="font-semibold mb-2">Quarterly Review</h3>
              <p className="text-blue-100 text-sm mb-4">
                Q3 performance review is scheduled for next week. Please prepare
                department summaries.
              </p>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none">
                View Agenda
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>;
}