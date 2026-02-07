import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, FileText, UserPlus, BarChart3, LogOut, Gavel, X, ShieldAlert, Globe } from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
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
    icon: LayoutDashboard,
    label: 'Dashboard',
    to: '/dashboard',
    roles: ['all']
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
    icon: UserPlus,
    label: 'Staff Registration',
    to: '/staff',
    roles: ['court_admin', 'it_admin', 'admin']
  }, {
    icon: BarChart3,
    label: 'Reports & Analytics',
    to: '/reports',
    roles: ['judge', 'court_admin', 'auditor', 'registrar']
  }, {
    icon: ShieldAlert,
    label: 'Audit Logs',
    to: '/audit',
    roles: ['auditor', 'it_admin', 'admin', 'court_admin']
  }, {
    icon: Globe,
    label: 'Partner Network',
    to: '/interoperability',
    roles: ['it_admin', 'admin', 'partner', 'court_admin']
  }];
  // Filter items based on user role
  const navItems = allNavItems.filter(item => {
    if (!user) return false;
    if (item.roles.includes('all')) return true;
    // Map 'admin' to 'it_admin' capabilities if needed, or keep distinct
    const userRole: UserRole = user.role;
    return item.roles.includes(userRole);
  });
  const handleLogout = async () => {
    await logout();
    onClose();
  };
  return <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={`
          fixed left-0 top-0 z-50 h-screen w-72 bg-primary text-white transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-blue-800 px-4">
          <div className="flex items-center gap-2">
            <Gavel className="h-6 w-6 text-yellow-400" />
            <span className="text-base font-bold tracking-tight">
              KADUNA HIGH COURT
            </span>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-blue-800 rounded-md transition-colors" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col justify-between h-[calc(100vh-4rem)]">
          <nav className="space-y-1 px-3 py-4 overflow-y-auto">
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
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-blue-800 bg-blue-900/20">
            {user && <div className="mb-4 px-2">
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
              </div>}
            <NavLink to="/" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md bg-blue-900/50 px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </NavLink>
          </div>
        </div>
      </aside>
    </>;
}