import React from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle, Wrench } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useSystem } from '../contexts/SystemContext';
interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
export function NotificationsPanel({
  isOpen,
  onClose
}: NotificationsPanelProps) {
<<<<<<< HEAD
  const { notifications, clearNotification } = useSystem();
=======
  const {
    notifications,
    clearNotification
  } = useSystem();
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  if (!isOpen) return null;
  const getIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-amber-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'bg-amber-50 border-amber-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  const handleClearAll = () => {
<<<<<<< HEAD
    notifications.forEach((n) => clearNotification(n.id));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
=======
    notifications.forEach(n => clearNotification(n.id));
  };
  return <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Notifications
            </h2>
<<<<<<< HEAD
            {notifications.length > 0 &&
            <Badge variant="danger" className="ml-2">
                {notifications.length}
              </Badge>
            }
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors">

=======
            {notifications.length > 0 && <Badge variant="danger" className="ml-2">
                {notifications.length}
              </Badge>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
<<<<<<< HEAD
          {notifications.length > 0 ?
          <div className="divide-y divide-slate-100">
              {notifications.map((notification) =>
            <div
              key={notification.id}
              className={`p-4 border-l-4 ${getBackgroundColor(notification.type)} hover:bg-opacity-80 transition-colors`}>

=======
          {notifications.length > 0 ? <div className="divide-y divide-slate-100">
              {notifications.map(notification => <div key={notification.id} className={`p-4 border-l-4 ${getBackgroundColor(notification.type)} hover:bg-opacity-80 transition-colors`}>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {notification.title}
                        </h3>
<<<<<<< HEAD
                        <button
                      onClick={() => clearNotification(notification.id)}
                      className="flex-shrink-0 p-1 hover:bg-slate-200 rounded-full transition-colors">

=======
                        <button onClick={() => clearNotification(notification.id)} className="flex-shrink-0 p-1 hover:bg-slate-200 rounded-full transition-colors">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                          <X className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{notification.createdBy}</span>
                        <span>•</span>
                        <span>
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
<<<<<<< HEAD
                </div>
            )}
            </div> :

          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
=======
                </div>)}
            </div> : <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
              <Bell className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No notifications
              </h3>
              <p className="text-sm text-slate-500">
                You're all caught up! Check back later for updates.
              </p>
<<<<<<< HEAD
            </div>
          }
        </div>

        {notifications.length > 0 &&
        <div className="p-4 border-t border-slate-200 bg-slate-50">
            <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleClearAll}>

              Clear All Notifications
            </Button>
          </div>
        }
      </div>
    </div>);

=======
            </div>}
        </div>

        {notifications.length > 0 && <div className="p-4 border-t border-slate-200 bg-slate-50">
            <Button variant="outline" size="sm" className="w-full" onClick={handleClearAll}>
              Clear All Notifications
            </Button>
          </div>}
      </div>
    </div>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}