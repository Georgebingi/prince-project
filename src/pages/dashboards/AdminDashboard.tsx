import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Users, Server, Activity, Database, Shield, Settings, UserPlus, FileText, Download, AlertTriangle, X, Bell, Send, Trash2, Check, Eye, FolderOpen, ChevronRight } from 'lucide-react';

import { useStaff, StaffMember } from '../../contexts/StaffContext';
import { useCases } from '../../contexts/CasesContext';
import { useSystem } from '../../contexts/SystemContext';
import { auditLogsApi, ApiError } from '../../services/api';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { staff, deleteStaff, approveStaff } = useStaff();
  const { cases } = useCases();
  const { settings, toggleMaintenanceMode, addSystemNotification, isMaintenanceActive } = useSystem();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showUserCasesModal, setShowUserCasesModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [maintenanceDuration, setMaintenanceDuration] = useState(30);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Staff search state
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  
  // Audit logs state

  const [auditLogs, setAuditLogs] = useState<Array<{
    id: number;
    timestamp: string;
    user_name: string;
    action: string;
    resource: string;
    resource_id: string;
    ip_address: string;
    details?: string;
  }>>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsError, setAuditLogsError] = useState<string | null>(null);

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

  // Get cases associated with a staff member
  const getUserCases = (staffMember: StaffMember) => {
    const name = staffMember.name;
    return cases.filter(
      (c) => c.judge === name || c.lawyer === name || c.createdBy === name
    );
  };

  const selectedUserCases = selectedStaff ? getUserCases(selectedStaff) : [];

  const handleStaffClick = (user: StaffMember) => {
    setSelectedStaff(user);
    setShowUserCasesModal(true);
  };

  const handleGenerateAuditReport = async () => {
    setShowAuditModal(true);
    setAuditLogsLoading(true);
    setAuditLogsError(null);
    
    try {
      const response = await auditLogsApi.getAuditLogs({ limit: 100 });
      if (response.success && response.data) {
        setAuditLogs(response.data as typeof auditLogs);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch audit logs');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load audit logs';
      setAuditLogsError(message);
      // Keep empty array on error
      setAuditLogs([]);
    } finally {
      setAuditLogsLoading(false);
    }
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

  const handleDeleteUser = async (e: React.MouseEvent, userId: string, userName: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await deleteStaff(userId);
        addSystemNotification({
          title: 'User Deleted',
          message: `User ${userName} has been removed from the system.`,
          type: 'warning',
          createdBy: 'System Administrator'
        });
        alert(`User "${userName}" has been deleted successfully.`);
      } catch (error) {
        alert(`Failed to delete user "${userName}". Please try again.`);
      }
    }
  };


  const handleApproveUser = async (e: React.MouseEvent, userId: string, userName: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to approve user "${userName}"?`)) {
      try {
        await approveStaff(userId);
        addSystemNotification({
          title: 'User Approved',
          message: `User ${userName} has been approved and can now access the system.`,
          type: 'success',
          createdBy: 'System Administrator'
        });
        alert(`User "${userName}" has been approved successfully.`);
      } catch (error) {
        alert(`Failed to approve user "${userName}". Please try again.`);
      }
    }
  };

  // Filter staff based on search query
  const filteredStaff = useMemo(() => {
    if (!staffSearchQuery.trim()) return staff;
    const query = staffSearchQuery.toLowerCase();
    return staff.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      (user.department && user.department.toLowerCase().includes(query)) ||
      user.email?.toLowerCase().includes(query)
    );
  }, [staff, staffSearchQuery]);



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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Staff Directory
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {filteredStaff.length} of {staff.length} staff members
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search staff..."
                      value={staffSearchQuery}
                      onChange={(e) => setStaffSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {staffSearchQuery && (
                      <button
                        onClick={() => setStaffSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportStaffPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Staff Member</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-center">Cases</th>
                      <th className="px-4 py-3 font-semibold">Last Active</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStaff.length > 0 ? (
                      filteredStaff.slice(0, 10).map((user) => {
                        const userCaseCount = getUserCases(user).length;
                        return (
                        <tr
                          key={user.id}
                          className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                          onClick={() => handleStaffClick(user)}
                        >

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </div>
                              <span className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                                {user.name}
                              </span>
                            </div>
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
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${userCaseCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
                            >
                              {userCaseCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {user.lastActive || 'Never'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStaffClick(user);
                                }}
                                title="View Cases"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {user.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-green-600"
                                  onClick={(e) => handleApproveUser(e, user.id, user.name)}
                                  title="Approve User"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                onClick={(e) => handleDeleteUser(e, user.id, user.name)}
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )})
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-sm font-medium">No staff members found</p>
                            <p className="text-xs text-slate-400">Try adjusting your search query</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredStaff.length > 10 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/staff')}>
                    View All {filteredStaff.length} Users
                  </Button>
                </div>
              )}
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
                {auditLogs.length > 0 && auditLogs.some(log => log.action === 'delete' || log.action === 'status_change') ? (
                  auditLogs.slice(0, 2).map((log) => (
                    <div key={log.id} className={`p-3 border rounded-lg ${
                      log.action === 'delete' 
                        ? 'bg-red-50 border-red-100' 
                        : log.action === 'status_change'
                          ? 'bg-amber-50 border-amber-100'
                          : 'bg-blue-50 border-blue-100'
                    }`}>
                      <p className={`text-sm font-medium ${
                        log.action === 'delete' 
                          ? 'text-red-900' 
                          : log.action === 'status_change'
                            ? 'text-amber-900'
                            : 'text-blue-900'
                      }`}>
                        {log.action === 'delete' ? 'User Deleted' : 
                         log.action === 'status_change' ? 'Status Changed' : 
                         log.action === 'approve' ? 'User Approved' : 'System Action'}
                      </p>
                      <p className={`text-xs mt-1 ${
                        log.action === 'delete' 
                          ? 'text-red-700' 
                          : log.action === 'status_change'
                            ? 'text-amber-700'
                            : 'text-blue-700'
                      }`}>
                        {log.user_name} performed {log.action} on {log.resource} {log.resource_id}
                        <br />
                        <span className="opacity-75">{new Date(log.timestamp).toLocaleString()}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <>
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
                  </>
                )}
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
                  <span className="text-xs text-slate-500">
                    {auditLogs.length > 0 
                      ? new Date(auditLogs[0].timestamp).toLocaleDateString() 
                      : '2 days ago'}
                  </span>
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

      {/* User Cases Modal */}
      {showUserCasesModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {selectedStaff.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {selectedStaff.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedStaff.role} • {selectedStaff.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUserCasesModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
                aria-label="Close user cases modal"
                type="button"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {/* User Info Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedUserCases.length}
                  </p>
                  <p className="text-xs text-slate-500">Total Cases</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {
                      selectedUserCases.filter(
                        (c) => c.status !== 'Closed' && c.status !== 'Disposed'
                      ).length
                    }
                  </p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-400">
                    {
                      selectedUserCases.filter(
                        (c) => c.status === 'Closed' || c.status === 'Disposed'
                      ).length
                    }
                  </p>
                  <p className="text-xs text-slate-500">Closed</p>
                </div>
              </div>

              {/* Cases List */}
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                {selectedStaff.role === 'Lawyer' || selectedStaff.role === 'Judge'
                  ? 'Assigned Cases'
                  : 'Associated Cases'}
              </h3>
              <div className="max-h-[40vh] overflow-y-auto space-y-2">
                {selectedUserCases.length > 0 ? (
                  selectedUserCases.map((c) => {
                    const roles: string[] = [];
                    if (c.judge === selectedStaff.name) roles.push('Judge');
                    if (c.lawyer === selectedStaff.name) roles.push('Lawyer');
                    if (c.createdBy === selectedStaff.name) roles.push('Creator');
                    // Determine who assigned this case to the user
                    const assignedBy = (() => {
                      if (c.lawyer === selectedStaff.name && c.judge) {
                        return c.judge;
                      }
                      if (
                        c.judge === selectedStaff.name &&
                        c.createdBy &&
                        c.createdBy !== selectedStaff.name
                      ) {
                        return c.createdBy;
                      }
                      if (c.createdBy === selectedStaff.name) {
                        return null; // Self-created
                      }
                      return c.createdBy || null;
                    })();
                    return (
                      <div
                        key={c.id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all group"
                        onClick={() => {
                          setShowUserCasesModal(false);
                          navigate(`/cases/${encodeURIComponent(c.id)}`);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono text-xs font-bold text-slate-500">
                                {c.id}
                              </span>
                              <Badge variant="secondary" className="text-[10px]">
                                {c.type}
                              </Badge>
                              <Badge
                                variant={
                                  c.status === 'In Progress'
                                    ? 'warning'
                                    : c.status === 'Pending Judgment'
                                      ? 'danger'
                                      : 'secondary'
                                }
                                className="text-[10px]"
                              >
                                {c.status}
                              </Badge>
                              {roles.map((role) => (
                                <span
                                  key={role}
                                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                            <h4 className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                              {c.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <p className="text-xs text-slate-500">
                                Filed: {c.filed} • Priority: {c.priority}
                              </p>
                              {assignedBy && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Assigned by: {assignedBy}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No cases found</p>
                    <p className="text-xs mt-1">
                      This user has no associated cases as judge, lawyer, or
                      creator.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowUserCasesModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Report Modal */}
      {showAuditModal && (
        <>

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
                  onClick={() => { setShowAuditModal(false); }}
                  className="p-1 hover:bg-slate-100 rounded-full"
                  aria-label="Close audit report"
                  type="button"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>

              </div>


              <div className="p-6 bg-slate-50 max-h-[60vh] overflow-y-auto print:bg-white print:max-h-none print:overflow-visible print:p-0">
                {auditLogsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-slate-600">Loading audit data...</span>
                  </div>
                ) : auditLogsError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <p className="font-medium">Error loading audit logs</p>
                    <p className="text-sm">{auditLogsError}</p>
                  </div>
                ) : (
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
                          <p className="text-slate-600">AUD-{new Date().getFullYear()}-{String(auditLogs.length).padStart(3, '0')}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">
                            Generated By:
                          </p>
                          <p className="text-slate-600">{staff.find(s => s.role === 'admin')?.name || 'System Administrator'}</p>
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
                          System integrity checks passed with 99.9% uptime. 
                          {auditLogs.length > 0 ? (
                            <> {auditLogs.filter(log => log.action === 'delete' || log.action === 'status_change').length} administrative actions 
                            and {auditLogs.filter(log => log.action === 'approve').length} user approvals recorded in the last 30 days.</>
                          ) : (
                            ' No critical security incidents reported in the last 30 days.'
                          )} User access logs show normal activity patterns.
                          Backup systems are functioning correctly.
                        </p>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold text-slate-900 mb-2">
                          Recent Activity Log
                        </h4>
                        {auditLogs.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-3 py-2">Timestamp</th>
                                  <th className="px-3 py-2">User</th>
                                  <th className="px-3 py-2">Action</th>
                                  <th className="px-3 py-2">Resource</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {auditLogs.slice(0, 10).map((log) => (
                                  <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 text-xs text-slate-500">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 font-medium text-slate-900">
                                      {log.user_name}
                                    </td>
                                    <td className="px-3 py-2">
                                      <Badge 
                                        variant={
                                          log.action === 'delete' ? 'danger' :
                                          log.action === 'approve' ? 'success' :
                                          log.action === 'status_change' ? 'warning' :
                                          'secondary'
                                        }
                                        className="text-[10px]"
                                      >
                                        {log.action}
                                      </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-600">
                                      {log.resource} {log.resource_id}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No audit logs available. The audit logging system may not be initialized yet.</p>
                        )}
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold text-slate-900 mb-2">
                          Key Metrics
                        </h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                          <li>Total Audit Records: {auditLogs.length}</li>
                          <li>User Deletions: {auditLogs.filter(log => log.action === 'delete').length}</li>
                          <li>User Approvals: {auditLogs.filter(log => log.action === 'approve').length}</li>
                          <li>Status Changes: {auditLogs.filter(log => log.action === 'status_change').length}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
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
        </>
      )}
    </Layout>
  );
}
