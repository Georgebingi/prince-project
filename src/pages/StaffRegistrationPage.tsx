import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import {
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  Shield,
  MoreVertical } from
'lucide-react';
import { useStaff } from '../contexts/StaffContext';
export function StaffRegistrationPage() {
  const { staff, addStaff, updateStaffStatus, deleteStaff } = useStaff();
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    department: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.email ||
    !formData.password ||
    !formData.role)
    {
      alert('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      addStaff({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: formData.role,
        department: formData.department || 'General',
        status: 'Active'
      });
      setIsSubmitting(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        department: ''
      });
      alert('Staff account created successfully!');
    }, 1000);
  };
  return (
    <Layout title="Staff Registration & Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                <UserPlus className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Register New Staff
              </h3>
            </div>

            <form className="space-y-4" onSubmit={handleCreateAccount}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    firstName: e.target.value
                  })
                  } />

                <Input
                  label="Last Name *"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastName: e.target.value
                  })
                  } />

              </div>

              <Input
                label="Email Address *"
                type="email"
                placeholder="john.doe@court.gov.ng"
                value={formData.email}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
                } />


              <Input
                label="Password *"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value
                })
                } />


              <Select
                label="Role *"
                value={formData.role}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value
                })
                }
                options={[
                {
                  value: 'Judge',
                  label: 'Judge'
                },
                {
                  value: 'Registrar',
                  label: 'Registrar'
                },
                {
                  value: 'Clerk',
                  label: 'Clerk'
                },
                {
                  value: 'Lawyer',
                  label: 'Lawyer'
                },
                {
                  value: 'Admin',
                  label: 'Administrator'
                },
                {
                  value: 'IT Admin',
                  label: 'IT Administrator'
                },
                {
                  value: 'Auditor',
                  label: 'Auditor'
                }]
                }
                placeholder="Select Role..." />


              <Select
                label="Department"
                value={formData.department}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  department: e.target.value
                })
                }
                options={[
                {
                  value: 'High Court',
                  label: 'High Court'
                },
                {
                  value: 'Registry',
                  label: 'Registry'
                },
                {
                  value: 'IT Dept',
                  label: 'IT Department'
                },
                {
                  value: 'Legal',
                  label: 'Legal Department'
                },
                {
                  value: 'Admin',
                  label: 'Administration'
                }]
                }
                placeholder="Select Department..." />


              <div className="pt-4">
                <Button
                  className="w-full"
                  type="submit"
                  isLoading={isSubmitting}>

                  Create Account
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Staff Directory
              </h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />

                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Staff Details</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((user) =>
                  <tr key={user.id} className="hover:bg-slate-50 group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {user.name.
                          split(' ').
                          map((n) => n[0]).
                          join('').
                          slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-slate-900">{user.role}</span>
                          <span className="text-xs text-slate-500">
                            {user.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                        variant={
                        user.status === 'Active' ?
                        'success' :
                        user.status === 'Inactive' ?
                        'secondary' :
                        'danger'
                        }>

                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {user.joinedDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>);

}