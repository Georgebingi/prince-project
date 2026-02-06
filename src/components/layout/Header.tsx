<<<<<<< HEAD
import React, { useState } from 'react';
=======
import { useState } from 'react';
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
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
<<<<<<< HEAD
export function Header({ title, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { notifications } = useSystem();
=======
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
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  const navigate = useNavigate();
  // State for modals/panels
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.length;
<<<<<<< HEAD
  return (
    <>
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 shadow-sm relative z-30">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-md transition-colors">

=======
  return <>
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 shadow-sm relative z-30">
        <div className="flex items-center gap-4">
<<<<<<< HEAD
          {/* Menu button */}
          <button onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-md transition-colors">
=======
          {/* Mobile menu button */}
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-100 rounded-md transition-colors">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0
            <Menu className="h-6 w-6 text-slate-700" />
          </button>

          <h1 className="text-lg lg:text-xl font-semibold text-slate-800">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          {/* Search - hidden on mobile */}
<<<<<<< HEAD
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200 w-48 lg:w-64 cursor-text hover:bg-slate-100 transition-colors"
            onClick={() => setIsSearchOpen(true)}>

=======
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200 w-48 lg:w-64 cursor-text hover:bg-slate-100 transition-colors" onClick={() => setIsSearchOpen(true)}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            <Search className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Search...</span>
          </div>

          {/* Mobile search icon */}
<<<<<<< HEAD
          <button
            className="md:hidden p-2 hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => setIsSearchOpen(true)}>

=======
          <button className="md:hidden p-2 hover:bg-slate-100 rounded-md transition-colors" onClick={() => setIsSearchOpen(true)}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            <Search className="h-5 w-5 text-slate-500" />
          </button>

          <div className="flex items-center gap-3 lg:gap-4 relative">
<<<<<<< HEAD
            <button
              className="relative text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-md"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>

              <Bell className="h-5 w-5" />
              {unreadCount > 0 &&
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              }
            </button>

            {/* Notifications Panel */}
            <NotificationsPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)} />


            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {user &&
            <div
              className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/settings')}>

=======
            <button className="relative text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-md" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>}
            </button>

            {/* Notifications Panel */}
            <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {user && <div className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/settings')}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-900">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-medium text-sm overflow-hidden">
<<<<<<< HEAD
                  {user.name.
                split(' ').
                map((n) => n[0]).
                join('').
                slice(0, 2).
                toUpperCase()}
                </div>
              </div>
            }
=======
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </div>}
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
          </div>
        </div>
      </header>

      {/* Search Modal */}
<<<<<<< HEAD
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)} />

    </>);

=======
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}