import React, { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'maintenance' | 'success';
  createdAt: string;
  createdBy: string;
  recipientId?: string; // Optional field for targeted notifications
}
interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceDuration: number; // in minutes
  maintenanceStartTime: string | null;
  sessionTimeout: number;
}
interface SystemContextType {
  settings: SystemSettings;
  notifications: SystemNotification[];
  toggleMaintenanceMode: (duration?: number) => void;
<<<<<<< HEAD
  addSystemNotification: (
  notification: Omit<SystemNotification, 'id' | 'createdAt'>)
  => void;
=======
  addSystemNotification: (notification: Omit<SystemNotification, 'id' | 'createdAt'>) => void;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  clearNotification: (id: string) => void;
  isMaintenanceActive: () => boolean;
}
const SystemContext = createContext<SystemContextType | undefined>(undefined);
const INITIAL_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  maintenanceDuration: 30,
  maintenanceStartTime: null,
  sessionTimeout: 30
};
const INITIAL_NOTIFICATIONS: SystemNotification[] = [];
<<<<<<< HEAD
export function SystemProvider({ children }: {children: ReactNode;}) {
  const { user } = useAuth();
=======
export function SystemProvider({
  children
}: {
  children: ReactNode;
}) {
  const {
    user
  } = useAuth();
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });
<<<<<<< HEAD
  const [notifications, setNotifications] = useState<SystemNotification[]>(
    () => {
      const saved = localStorage.getItem('system_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    }
  );
=======
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('system_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  useEffect(() => {
    localStorage.setItem('system_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('system_notifications', JSON.stringify(notifications));
  }, [notifications]);
  // Check if maintenance mode should be automatically disabled
  useEffect(() => {
    if (settings.maintenanceMode && settings.maintenanceStartTime) {
      const startTime = new Date(settings.maintenanceStartTime).getTime();
      const endTime = startTime + settings.maintenanceDuration * 60 * 1000;
      const now = Date.now();
      if (now >= endTime) {
        // Maintenance period has expired
<<<<<<< HEAD
        setSettings((prev) => ({
=======
        setSettings(prev => ({
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
          ...prev,
          maintenanceMode: false,
          maintenanceStartTime: null
        }));
      } else {
        // Set timeout to disable maintenance mode automatically
        const timeoutId = setTimeout(() => {
<<<<<<< HEAD
          setSettings((prev) => ({
=======
          setSettings(prev => ({
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
            ...prev,
            maintenanceMode: false,
            maintenanceStartTime: null
          }));
        }, endTime - now);
        return () => clearTimeout(timeoutId);
      }
    }
<<<<<<< HEAD
  }, [
  settings.maintenanceMode,
  settings.maintenanceStartTime,
  settings.maintenanceDuration]
  );
  const toggleMaintenanceMode = (duration?: number) => {
    setSettings((prev) => {
=======
  }, [settings.maintenanceMode, settings.maintenanceStartTime, settings.maintenanceDuration]);
  const toggleMaintenanceMode = (duration?: number) => {
    setSettings(prev => {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
      const newMode = !prev.maintenanceMode;
      return {
        ...prev,
        maintenanceMode: newMode,
        maintenanceDuration: duration || prev.maintenanceDuration,
        maintenanceStartTime: newMode ? new Date().toISOString() : null
      };
    });
  };
<<<<<<< HEAD
  const addSystemNotification = (
  notification: Omit<SystemNotification, 'id' | 'createdAt'>) =>
  {
=======
  const addSystemNotification = (notification: Omit<SystemNotification, 'id' | 'createdAt'>) => {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    const newNotification: SystemNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
<<<<<<< HEAD
    setNotifications((prev) => [newNotification, ...prev]);
  };
  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  const isMaintenanceActive = () => {
    if (!settings.maintenanceMode || !settings.maintenanceStartTime)
    return false;
=======
    setNotifications(prev => [newNotification, ...prev]);
  };
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  const isMaintenanceActive = () => {
    if (!settings.maintenanceMode || !settings.maintenanceStartTime) return false;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
    const startTime = new Date(settings.maintenanceStartTime).getTime();
    const endTime = startTime + settings.maintenanceDuration * 60 * 1000;
    const now = Date.now();
    return now < endTime;
  };
  // Filter notifications for the current user
<<<<<<< HEAD
  const filteredNotifications = notifications.filter(
    (n) => !n.recipientId || user && n.recipientId === user.staffId
  );
  return (
    <SystemContext.Provider
      value={{
        settings,
        notifications: filteredNotifications,
        toggleMaintenanceMode,
        addSystemNotification,
        clearNotification,
        isMaintenanceActive
      }}>

      {children}
    </SystemContext.Provider>);

=======
  const filteredNotifications = notifications.filter(n => !n.recipientId || user && n.recipientId === user.staffId);
  return <SystemContext.Provider value={{
    settings,
    notifications: filteredNotifications,
    toggleMaintenanceMode,
    addSystemNotification,
    clearNotification,
    isMaintenanceActive
  }}>
      {children}
    </SystemContext.Provider>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}
export function useSystem() {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}