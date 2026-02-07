import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSystem } from '../../contexts/SystemContext';
import { SearchModal } from '../SearchModal';
import { NotificationsPanel } from '../NotificationsPanel';
interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}
export function Header({
  title,
  onMenuClick
}: HeaderProps) {
  const {
    user
  } = useAuth();
  const {
    notifications
  } = useSystem();
  const navigate = useNavigate();
  // State for modals/panels
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.length;

  return <>
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 shadow-sm relative z-30">
        <div className="flex items-center gap-4">
          {/* Menu button - toggles sidebar */}
          <button type="button" onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-md transition-colors" aria-label="Toggle sidebar">
            <Menu className="h-6 w-6 text-slate-700" />
          </button>

          <h1 className="text-lg lg:text-xl font-semibold text-slate-800">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          {/* Search - hidden on mobile */}
          <div role="button" tabIndex={0} className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200 w-48 lg:w-64 cursor-text hover:bg-slate-100 transition-colors" onClick={() => setIsSearchOpen(true)} onKeyDown={(e) => e.key === 'Enter' && setIsSearchOpen(true)} aria-label="Open search">
            <Search className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Search...</span>
          </div>

          {/* Mobile search icon */}
          <button type="button" className="md:hidden p-2 hover:bg-slate-100 rounded-md transition-colors" onClick={() => setIsSearchOpen(true)} aria-label="Open search">
            <Search className="h-5 w-5 text-slate-500" />
          </button>

          <div className="flex items-center gap-3 lg:gap-4 relative">
            <button type="button" className="relative text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-md" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>}
            </button>

            {/* Notifications Panel */}
            <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {user && <div className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/settings')}>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-900">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-medium text-sm overflow-hidden">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </div>}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>;
}