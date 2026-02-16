/**
 * TanStack Query hooks for notifications management
 * Provides caching, optimistic updates, and prefetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateCache } from '../queryClient';

import { notificationsApi } from '../services/api';

// Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  caseId?: string;
  link?: string;
  [key: string]: unknown;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * Fetch all notifications
 */
export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: filters.unreadOnly 
      ? queryKeys.notifications.unread
      : queryKeys.notifications.all,
    queryFn: async () => {
      const response = await notificationsApi.getNotifications(filters);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch notifications');
      }
      return response.data as Notification[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch unread notifications only
 */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.unread,
    queryFn: async () => {
      const response = await notificationsApi.getNotifications({ unreadOnly: true });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch unread notifications');
      }
      return response.data as Notification[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch single notification by ID
 */
export function useNotification(id: string) {
  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: async () => {
      const response = await notificationsApi.getNotifications({});
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch notification');
      }
      const notification = (response.data as Notification[])?.find(n => n.id === id);
      if (!notification) {
        throw new Error('Notification not found');
      }
      return notification;
    },
    enabled: !!id,
  });
}

/**
 * Mark notification as read with optimistic update
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationsApi.markAsRead(notificationId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to mark notification as read');
      }
      return response.data;
    },
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unread });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.detail(notificationId) });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications.all);
      const previousUnreadNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications.unread);
      const previousNotification = queryClient.getQueryData<Notification>(queryKeys.notifications.detail(notificationId));

      // Optimistically mark as read
      queryClient.setQueryData<Notification>(queryKeys.notifications.detail(notificationId), (old) => {
        return old ? { ...old, isRead: true } : old;
      });

      queryClient.setQueryData<Notification[]>(queryKeys.notifications.all, (old) => {
        return old ? old.map(n => n.id === notificationId ? { ...n, isRead: true } : n) : old;
      });

      // Remove from unread list
      if (previousUnreadNotifications) {
        queryClient.setQueryData<Notification[]>(queryKeys.notifications.unread, (old) => {
          return old ? old.filter(n => n.id !== notificationId) : [];
        });
      }

      return { previousNotifications, previousUnreadNotifications, previousNotification };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.all, context.previousNotifications);
      }
      if (context?.previousUnreadNotifications) {
        queryClient.setQueryData(queryKeys.notifications.unread, context.previousUnreadNotifications);
      }
      if (context?.previousNotification) {
        queryClient.setQueryData(queryKeys.notifications.detail(_variables), context.previousNotification);
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.notifications();
      invalidateCache.notification(variables);
    },
  });
}

/**
 * Mark all notifications as read with optimistic update
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationsApi.markAllAsRead();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to mark all notifications as read');
      }
      return response.data;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unread });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications.all);
      const previousUnreadNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications.unread);

      // Optimistically mark all as read
      queryClient.setQueryData<Notification[]>(queryKeys.notifications.all, (old) => {
        return old ? old.map(n => ({ ...n, isRead: true })) : old;
      });

      // Clear unread list
      queryClient.setQueryData<Notification[]>(queryKeys.notifications.unread, () => []);

      return { previousNotifications, previousUnreadNotifications };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.all, context.previousNotifications);
      }
      if (context?.previousUnreadNotifications) {
        queryClient.setQueryData(queryKeys.notifications.unread, context.previousUnreadNotifications);
      }
    },
    onSettled: () => {
      invalidateCache.notifications();
    },
  });
}

/**
 * Delete notification with optimistic update
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationsApi.deleteNotification(notificationId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete notification');
      }
      return notificationId;
    },
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unread });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.detail(notificationId) });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications.all);
      const previousUnreadNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications.unread);

      // Optimistically remove notification
      queryClient.setQueryData<Notification[]>(queryKeys.notifications.all, (old) => {
        return old ? old.filter(n => n.id !== notificationId) : [];
      });

      queryClient.setQueryData<Notification[]>(queryKeys.notifications.unread, (old) => {
        return old ? old.filter(n => n.id !== notificationId) : [];
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.notifications.detail(notificationId) });

      return { previousNotifications, previousUnreadNotifications };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.all, context.previousNotifications);
      }
      if (context?.previousUnreadNotifications) {
        queryClient.setQueryData(queryKeys.notifications.unread, context.previousUnreadNotifications);
      }
    },
    onSettled: () => {
      invalidateCache.notifications();
    },
  });
}

/**
 * Prefetch notifications
 */
export function usePrefetchNotifications() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.notifications.all,
      queryFn: async () => {
        const response = await notificationsApi.getNotifications({});
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
