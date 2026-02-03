import React from 'react';
import { NavLink } from 'react-router-dom';
<<<<<<< HEAD
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  UserPlus,
  BarChart3,
  LogOut,
  Gavel,
  X,
  ShieldAlert,
  Globe,
  Users } from
'lucide-react';
=======
import { LayoutDashboard, FolderOpen, FileText, UserPlus, BarChart3, LogOut, Gavel, X, ShieldAlert, Globe, Users } from 'lucide-react';
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
import { useAuth, UserRole } from '../../contexts/AuthContext';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
<<<<<<< HEAD
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  // Define all possible nav items
  const allNavItems = [
  {
=======
export function Sidebar({
  isOpen,
  onClose
}: SidebarProps) {
  const {
    user,
    logout
  } = useAuth();
  // Define all possible nav items
  const allNavItems = [{
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    icon: LayoutDashboard,
    label: 'Dashboard',
    to: '/dashboard',
    roles: ['all']
<<<<<<< HEAD
  },
  {
    icon: FolderOpen,
    label: 'Case Management',
    to: '/cases',
    roles: [
    'judge',
    'registrar',
    'clerk',
    'lawyer',
    'court_admin',
    'partner']

  },
  {
    icon: FileText,
    label: 'Document Repository',
    to: '/documents',
    roles: [
    'judge',
    'registrar',
    'clerk',
    'lawyer',
    'court_admin',
    'it_admin']

  },
  {
=======
  }, {
    icon: FolderOpen,
    label: 'Case Management',
    to: '/cases',
    roles: ['judge', 'registrar', 'clerk', 'lawyer', 'court_admin', 'partner']
  }, {
    icon: FileText,
    label: 'Document Repository',
    to: '/documents',
    roles: ['judge', 'registrar', 'clerk', 'lawyer', 'court_admin', 'it_admin']
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    icon: UserPlus,
    label: 'Staff Registration',
    to: '/staff',
    roles: ['court_admin', 'it_admin', 'admin']
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    icon: BarChart3,
    label: 'Reports & Analytics',
    to: '/reports',
    roles: ['judge', 'court_admin', 'auditor', 'registrar']
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    icon: ShieldAlert,
    label: 'Audit Logs',
    to: '/audit',
    roles: ['auditor', 'it_admin', 'admin', 'court_admin']
<<<<<<< HEAD
  },
  {
=======
  }, {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    icon: Globe,
    label: 'Partner Network',
    to: '/interoperability',
    roles: ['it_admin', 'admin', 'partner', 'court_admin']
  }];
<<<<<<< HEAD

  // Filter items based on user role
  const navItems = allNavItems.filter((item) => {
=======
  // Filter items based on user role
  const navItems = allNavItems.filter(item => {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    if (!user) return false;
    if (item.roles.includes('all')) return true;
    // Map 'admin' to 'it_admin' capabilities if needed, or keep distinct
    const userRole = user.role;
    return item.roles.includes(userRole);
  });
  const handleLogout = () => {
    logout();
    onClose();
  };
<<<<<<< HEAD
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen &&
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
        onClick={onClose} />

      }

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72 bg-primary text-white transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>

=======
  return <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={`
          fixed left-0 top-0 z-50 h-screen w-72 bg-primary text-white transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-blue-800 px-4">
          <div className="flex items-center gap-2">
            <Gavel className="h-6 w-6 text-yellow-400" />
            <span className="text-base font-bold tracking-tight">
              KADUNA HIGH COURT
            </span>
          </div>
<<<<<<< HEAD
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-blue-800 rounded-md transition-colors">

=======
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-blue-800 rounded-md transition-colors">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col justify-between h-[calc(100vh-4rem)]">
          <nav className="space-y-1 px-3 py-4 overflow-y-auto">
<<<<<<< HEAD
            {navItems.map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose()}
              className={({ isActive }) => `
                  flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}
                `}>

                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            )}
=======
            {navItems.map(item => <NavLink key={item.to} to={item.to} onClick={() => onClose()} className={({
            isActive
          }) => `
                  flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}
                `}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>)}
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-blue-800 bg-blue-900/20">
<<<<<<< HEAD
            {user &&
            <div className="mb-4 px-2">
=======
            {user && <div className="mb-4 px-2">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Logged in as
                </p>
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-xs text-blue-200 capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
<<<<<<< HEAD
              </div>
            }
            <NavLink
              to="/"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md bg-blue-900/50 px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors">

=======
              </div>}
            <NavLink to="/" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md bg-blue-900/50 px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
              <LogOut className="h-4 w-4" />
              Sign Out
            </NavLink>
          </div>
        </div>
      </aside>
<<<<<<< HEAD
    </>);

=======
    </>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}