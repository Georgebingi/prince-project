import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Users, Server, Activity, Database, Shield, Settings, UserPlus, FileText, Download, AlertTriangle, X, Bell, Send } from 'lucide-react';
import { useStaff } from '../../contexts/StaffContext';
import { useCases } from '../../contexts/CasesContext';
import { useSystem } from '../../contexts/SystemContext';
export function AdminDashboard() {
  const navigate = useNavigate();
  const { staff } = useStaff();
  const { cases } = useCases();
  const { settings, toggleMaintenanceMode, addSystemNotification, isMaintenanceActive } = useSystem();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [maintenanceDuration, setMaintenanceDuration] = useState(30);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalUsers = staff.length;
    const activeUsers = staff.filter(s => s.status === 'active').length;
    const totalDocs = cases.reduce((acc, c) => acc + c.documents.length, 0);
    const storageUsed = (totalDocs * 2.5 + 45).toFixed(1);
    return {
      totalUsers,
      activeSessions: Math.floor(activeUsers * 0.8),
      storageUsed,
      systemHealth: '99.9%'
    };
  }, [staff, cases]);
  const handleGenerateAuditReport = () => {
    setShowAuditModal(true);
  };
  const handleDownloadAuditReport = () => {
    window.print();
  };
  const handleExportStaffPDF = () => {
    window.print();
  };
  const handleToggleMaintenance = () => {
    toggleMaintenanceMode(maintenanceDuration);
    // Send notification about maintenance mode change
    if (!settings.maintenanceMode) {
      addSystemNotification({
        title: 'System Maintenance Scheduled',
        message: `The system will be under maintenance for ${maintenanceDuration} minutes. Only administrators can access during this time.`,
        type: 'maintenance',
        createdBy: 'System Administrator'
      });
    } else {
      addSystemNotification({
        title: 'Maintenance Mode Disabled',
        message: 'The system is now fully operational. All users can access normally.',
        type: 'success',
        createdBy: 'System Administrator'
      });
    }
    setShowConfigModal(false);
  };
  const handleSendNotification = () => {
    if (!notificationTitle || !notificationMessage) {
      alert('Please fill in both title and message');
      return;
    }
    addSystemNotification({
      title: notificationTitle,
      message: notificationMessage,
      type: 'info',
      createdBy: 'System Administrator'
    });
    setNotificationTitle('');
    setNotificationMessage('');
    setShowNotificationModal(false);
    alert('Notification sent to all users!');
  };

  return (
    <Layout title="System Administration" showLogoBanner={false}>
      <div className="space-y-6 print:hidden">
        {/* Maintenance Mode Alert */}
        {isMaintenanceActive() && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  Maintenance Mode Active
                </p>
                <p className="text-sm text-amber-700">
                  System is in maintenance mode. Only administrators can access.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowConfigModal(true)}>
                Manage
              </Button>
            </div>
          </div>
        )}

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Users</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.totalUsers}
                </h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  {staff.filter(s => s.status === 'active').length} Active
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active Sessions</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.activeSessions}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Current concurrent users
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Activity className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">System Health</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {stats.systemHealth}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  All systems operational
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Server className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Storage Used</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.storageUsed} GB
                </h3>
                <p className="text-xs text-slate-500 mt-1">of 5.0 TB Total</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Database className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-slate-50 border-slate-200" onClick={() => navigate('/staff')}>
                <UserPlus className="h-6 w-6 text-blue-600" />
                <span>Add New User</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-slate-50 border-slate-200" onClick={() => setShowConfigModal(true)}>
                <Settings className="h-6 w-6 text-slate-600" />
                <span>System Config</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-slate-50 border-slate-200" onClick={handleGenerateAuditReport}>
                <FileText className="h-6 w-6 text-amber-600" />
                <span>Generate Audit Report</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-slate-50 border-slate-200" onClick={() => setShowNotificationModal(true)}>
                <Bell className="h-6 w-6 text-purple-600" />
                <span>Send Notification</span>
              </Button>
            </div>

            {/* Staff Manager Tab */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Staff Management
                </h3>
                <Button variant="outline" size="sm" onClick={handleExportStaffPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF Report
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staff.slice(0, 5).map(user => <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {user.role}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {user.department}
                        </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            user.status === 'active'
                              ? 'success'
                              : user.status === 'pending'
                                ? 'warning'
                                : user.status === 'suspended'
                                  ? 'secondary'
                                  : 'danger'
                          }
                        >
                          {user.status === 'active'
                            ? 'Active'
                            : user.status === 'pending'
                              ? 'Pending'
                              : user.status === 'suspended'
                                ? 'Suspended'
                                : 'Rejected'}
                        </Badge>
                      </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {user.lastActive}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm" onClick={() => navigate('/staff')}>
                  View All Users
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6">
            {/* System Alerts */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                System Alerts
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-sm font-medium text-amber-900">
                    Backup Warning
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Last automated backup took longer than expected (45s).
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    System Update
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Scheduled maintenance in 3 days.
                  </p>
                </div>
              </div>
            </Card>

            {/* Security Status */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Security Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Firewall</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Encryption</span>
                  <Badge variant="success">AES-256</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    2FA Enforcement
                  </span>
                  <Badge variant="warning">Optional</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Last Audit</span>
                  <span className="text-xs text-slate-500">2 days ago</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* System Config Modal */}
      {showConfigModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-500" />
                System Configuration
              </h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
                aria-label="Close system configuration"
                type="button"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="system-name">
                  System Name
                </label>
                <input
                  id="system-name"
                  type="text"
                  value="Kaduna High Court Management System"
                  className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                  readOnly
                  aria-readonly="true"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Maintenance Mode
                </label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleMaintenance}
                      className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}
                      aria-label="Toggle maintenance mode"
                      type="button"
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                    </button>
                    <span className="text-sm text-slate-700">
                      {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {settings.maintenanceMode && <Badge variant="warning">Active</Badge>}
                </div>
              </div>
              {!settings.maintenanceMode && <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="maintenance-duration">
                    Maintenance Duration (minutes)
                  </label>
                  <input
                    id="maintenance-duration"
                    type="number"
                    value={maintenanceDuration}
                    onChange={e => setMaintenanceDuration(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    aria-label="Maintenance duration in minutes"
                  />
                </div>}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="session-timeout">
                  Session Timeout (mins)
                </label>
                <input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  className="w-full p-2 border border-slate-300 rounded-md"
                  aria-label="Session timeout in minutes"
                />
              </div>
              <div className="p-4 bg-blue-50 rounded-md text-sm text-blue-700">
                <p>
                  Maintenance mode will disable all logins except
                  administrators.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfigModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>}

      {/* Send Notification Modal */}
      {showNotificationModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-slate-500" />
                Send System Notification
              </h2>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
                aria-label="Close notification modal"
                type="button"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Notification Title" placeholder="e.g., Scheduled Maintenance" value={notificationTitle} onChange={e => setNotificationTitle(e.target.value)} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea className="w-full h-32 p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter notification message..." value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)}></textarea>
              </div>
              <div className="p-4 bg-blue-50 rounded-md text-sm text-blue-700">
                <p>
                  This notification will be sent to all users and displayed in
                  their notification panel.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNotificationModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendNotification}>
                <Send className="h-4 w-4 mr-2" />
                Send to All Users
              </Button>
            </div>
          </div>
        </div>}

      {/* Audit Report Modal */}
      {showAuditModal && <>
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-audit-report, #printable-audit-report * {
                visibility: visible;
              }
              #printable-audit-report {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
                padding: 20px;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:static print:bg-white print:p-0">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 no-print">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-500" />
                  System Audit Report
                </h2>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
                aria-label="Close audit report"
                type="button"
              >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 bg-slate-50 max-h-[60vh] overflow-y-auto print:bg-white print:max-h-none print:overflow-visible print:p-0">
                <div id="printable-audit-report" className="bg-white p-8 shadow-sm border border-slate-200 print:border-none print:shadow-none">
                  <div className="text-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold uppercase">
                      System Audit Report
                    </h3>
                    <p className="text-sm text-slate-500">
                      Generated on {new Date().toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-slate-700">
                          Report ID:
                        </p>
                        <p className="text-slate-600">AUD-2024-001</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">
                          Generated By:
                        </p>
                        <p className="text-slate-600">System Administrator</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Period:</p>
                        <p className="text-slate-600">Last 30 Days</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Status:</p>
                        <p className="text-green-600 font-medium">Compliant</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Executive Summary
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        System integrity checks passed with 99.9% uptime. No
                        critical security incidents reported in the last 30
                        days. User access logs show normal activity patterns.
                        Backup systems are functioning correctly.
                      </p>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Key Metrics
                      </h4>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Total Login Attempts: 1,245</li>
                        <li>Failed Login Attempts: 12 (0.9%)</li>
                        <li>New User Registrations: 5</li>
                        <li>Critical Errors: 0</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3 no-print">
                <Button variant="outline" onClick={() => setShowAuditModal(false)}>
                  Close
                </Button>
                <Button onClick={handleDownloadAuditReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </>}
    </Layout>
  );
}