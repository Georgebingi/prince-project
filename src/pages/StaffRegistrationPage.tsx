import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  UserPlus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
  X
} from 'lucide-react';
import { useStaff, StaffMember } from '../contexts/StaffContext';


export function StaffRegistrationPage() {
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    approveStaff,
    toggleStaffStatus,
    isLoading,
    error,
    refresh
  } = useStaff();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    staffId: '',
    role: '',
    department: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

  // Action menu ref
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filteredStaff = useMemo(() => {
    return staff.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [staff, searchQuery, statusFilter]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await addStaff({
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        staffId: formData.staffId,
        role: formData.role,
        department: formData.department,
        password: formData.password
      });

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        staffId: '',
        role: '',
        department: ''
      });
      setSuccessMessage('Staff member registered successfully! They will need approval before logging in.');
    } catch (err) {
      // Error is handled by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setEditFormData({
      name: staffMember.name,
      email: staffMember.email || '',
      role: staffMember.role,
      department: staffMember.department || ''
    });
    setIsEditModalOpen(true);
    setOpenActionMenu(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setIsSubmitting(true);
    try {
      await updateStaff(editingStaff.id, {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        department: editFormData.department
      });
      setSuccessMessage('Staff member updated successfully!');
      setIsEditModalOpen(false);
      setEditingStaff(null);
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (staffMember: StaffMember) => {
    setDeletingStaff(staffMember);
    setIsDeleteModalOpen(true);
    setOpenActionMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStaff) return;

    setIsSubmitting(true);
    try {
      await deleteStaff(deletingStaff.id);
      setSuccessMessage('Staff member deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeletingStaff(null);
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveClick = async (staffMember: StaffMember) => {
    setOpenActionMenu(null);
    setIsSubmitting(true);
    try {
      await approveStaff(staffMember.id);
      setSuccessMessage('Staff member approved successfully!');
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatusClick = async (staffMember: StaffMember) => {
    setOpenActionMenu(null);
    const newStatus = staffMember.status === 'active' ? 'suspended' : 'active';
    setIsSubmitting(true);
    try {
      await toggleStaffStatus(staffMember.id, newStatus);
      setSuccessMessage(`Staff member ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`);
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'secondary';
      case 'suspended':
        return 'danger';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getActionMenuOptions = (staffMember: StaffMember) => {
    const options = [];

    // Always show edit
    options.push({
      label: 'Edit Details',
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => handleEditClick(staffMember)
    });

    // Show approve only for pending/rejected
    if (staffMember.status === 'pending' || staffMember.status === 'rejected') {
      options.push({
        label: 'Approve',
        icon: <UserCheck className="h-4 w-4" />,
        onClick: () => handleApproveClick(staffMember)
      });
    }

    // Show activate/suspend toggle for active/pending/suspended
    if (staffMember.status === 'active') {
      options.push({
        label: 'Suspend',
        icon: <UserX className="h-4 w-4" />,
        onClick: () => handleToggleStatusClick(staffMember)
      });
    } else if (staffMember.status === 'suspended' || staffMember.status === 'pending') {
      options.push({
        label: 'Activate',
        icon: <UserCheck className="h-4 w-4" />,
        onClick: () => handleToggleStatusClick(staffMember)
      });
    }

    // Always show delete
    options.push({
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      onClick: () => handleDeleteClick(staffMember),
      danger: true
    });

    return options;
  };

  return (
    <Layout title="Staff Registration & Management" showLogoBanner={false}>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration Form */}
        <div>
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">
                Register New Staff
              </h3>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />

              <Input
                label="Staff ID"
                value={formData.staffId}
                onChange={(e) =>
                  setFormData({ ...formData, staffId: e.target.value })
                }
                required
              />

              <Select
                label="Role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                options={[
                  { value: '', label: 'Select Role' },
                  { value: 'judge', label: 'Judge' },
                  { value: 'registrar', label: 'Registrar' },
                  { value: 'clerk', label: 'Clerk' },
                  { value: 'lawyer', label: 'Lawyer' },
                  { value: 'court_admin', label: 'Court Admin' },
                  { value: 'it_admin', label: 'IT Admin' },
                  { value: 'auditor', label: 'Auditor' }
                ]}
                required
              />

              <Select
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                options={[
                  { value: '', label: 'Select Department' },
                  { value: 'Judicial', label: 'Judicial' },
                  { value: 'Registry', label: 'Registry' },
                  { value: 'Administration', label: 'Administration' },
                  { value: 'IT', label: 'Information Technology' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'Legal', label: 'Legal' }
                ]}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </form>
          </Card>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                Staff Directory
              </h3>

              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-3 h-9 border rounded-md"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'rejected', label: 'Rejected' }
                  ]}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded mb-4 flex justify-between">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
                <Button size="sm" onClick={refresh}>
                  Retry
                </Button>
              </div>
            )}

            {isLoading && !isSubmitting ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          No staff found
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3 text-slate-600">{user.email || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="capitalize">{user.role?.replace('_', ' ')}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={getStatusBadgeVariant(user.status)}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right relative">
                            <button
                              onClick={() =>
                                setOpenActionMenu(
                                  openActionMenu === user.id ? null : user.id
                                )
                              }
                              className="p-1 hover:bg-slate-100 rounded"
                              disabled={isSubmitting}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Action Menu Dropdown */}
                            {openActionMenu === user.id && (
                              <div
                                ref={actionMenuRef}
                                className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10"
                              >
                                {getActionMenuOptions(user).map((option, index) => (
                                  <button
                                    key={index}
                                    onClick={option.onClick}
                                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 ${
                                      option.danger ? 'text-red-600' : 'text-slate-700'
                                    }`}
                                  >
                                    {option.icon}
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Staff Details</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStaff(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
              />

              <Input
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                required
              />

              <Select
                label="Role"
                value={editFormData.role}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, role: e.target.value })
                }
                options={[
                  { value: 'judge', label: 'Judge' },
                  { value: 'registrar', label: 'Registrar' },
                  { value: 'clerk', label: 'Clerk' },
                  { value: 'lawyer', label: 'Lawyer' },
                  { value: 'court_admin', label: 'Court Admin' },
                  { value: 'it_admin', label: 'IT Admin' },
                  { value: 'auditor', label: 'Auditor' }
                ]}
                required
              />

              <Select
                label="Department"
                value={editFormData.department}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, department: e.target.value })
                }
                options={[
                  { value: '', label: 'Select Department' },
                  { value: 'Judicial', label: 'Judicial' },
                  { value: 'Registry', label: 'Registry' },
                  { value: 'Administration', label: 'Administration' },
                  { value: 'IT', label: 'Information Technology' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'Legal', label: 'Legal' }
                ]}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStaff(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{deletingStaff.name}</strong>? 
              This action cannot be undone and all their data will be permanently removed.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingStaff(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteConfirm}
                isLoading={isSubmitting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
