/**
 * TanStack Query Client Configuration
 * Optimized for performance with aggressive caching
 */

import { QueryClient } from '@tanstack/react-query';

// Query key factory for type-safe cache management
export const queryKeys = {
  cases: {
    all: ['cases'] as const,
    lists: (filters: Record<string, unknown>) => ['cases', 'list', filters] as const,
    detail: (id: string) => ['cases', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    lawyers: ['users', 'lawyers'] as const,
    judges: ['users', 'judges'] as const,
  },
  documents: {
    all: ['documents'] as const,
    byCase: (caseId: string) => ['documents', 'case', caseId] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
  },
  motions: {
    all: ['motions'] as const,
    byCase: (caseId: string) => ['motions', 'case', caseId] as const,
    detail: (id: number) => ['motions', 'detail', id] as const,
    pending: ['motions', 'pending'] as const,
  },
  orders: {
    all: ['orders'] as const,
    byCase: (caseId: string) => ['orders', 'case', caseId] as const,
    detail: (id: number) => ['orders', 'detail', id] as const,
    draft: ['orders', 'draft'] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    byDate: (date: string) => ['calendar', date] as const,
  },
  chat: {
    all: ['chat'] as const,
    messages: (userId: string) => ['chat', 'messages', userId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
    detail: (id: string) => ['notifications', 'detail', id] as const,
  },
};

// Optimized QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache persists for 10 minutes after last use
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus (reduces unnecessary requests)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect (we have WebSocket for real-time)
      refetchOnReconnect: false,
      // Placeholder data for better UX
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Prefetch strategies for common navigation patterns
export const prefetchStrategies = {
  // Prefetch case details when hovering over case links
  prefetchCase: (caseId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.cases.detail(caseId),
      staleTime: 5 * 60 * 1000,
    });
  },

  // Prefetch next page of cases for infinite scroll
  prefetchNextCasesPage: (page: number, filters: Record<string, unknown>) => {
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.cases.lists(filters), page],
      staleTime: 5 * 60 * 1000,
    });
  },

  // Prefetch user profile
  prefetchUser: (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      staleTime: 10 * 60 * 1000,
    });
  },
};

// Optimistic update helpers
export const optimisticUpdates = {
  // Update case in cache optimistically
  updateCase: (caseId: string, updates: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.cases.detail(caseId),
      (old: Record<string, unknown> | undefined) => 
        old ? { ...old, ...updates } : undefined
    );
  },

  // Add case to list optimistically
  addCase: (newCase: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.cases.all,
      (old: Array<Record<string, unknown>> | undefined) => 
        old ? [newCase, ...old] : [newCase]
    );
  },

  // Remove case from cache
  removeCase: (caseId: string) => {
    queryClient.removeQueries({ queryKey: queryKeys.cases.detail(caseId) });
    queryClient.setQueryData(
      queryKeys.cases.all,
      (old: Array<{ id: string }> | undefined) => 
        old ? old.filter((c) => c.id !== caseId) : undefined
    );
  },

  // Add document to case optimistically
  addDocument: (caseId: string, newDoc: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.documents.byCase(caseId),
      (old: Array<Record<string, unknown>> | undefined) => 
        old ? [newDoc, ...old] : [newDoc]
    );
  },

  // Remove document from case optimistically
  removeDocument: (caseId: string, docId: string) => {
    queryClient.setQueryData(
      queryKeys.documents.byCase(caseId),
      (old: Array<{ id: string }> | undefined) => 
        old ? old.filter((d) => d.id !== docId) : undefined
    );
  },

  // Add motion optimistically
  addMotion: (newMotion: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.motions.all,
      (old: Array<Record<string, unknown>> | undefined) => 
        old ? [newMotion, ...old] : [newMotion]
    );
  },

  // Update motion status optimistically
  updateMotion: (motionId: number, updates: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.motions.detail(motionId),
      (old: Record<string, unknown> | undefined) => 
        old ? { ...old, ...updates } : undefined
    );
  },

  // Add order optimistically
  addOrder: (newOrder: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.orders.all,
      (old: Array<Record<string, unknown>> | undefined) => 
        old ? [newOrder, ...old] : [newOrder]
    );
  },

  // Update order optimistically
  updateOrder: (orderId: number, updates: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.orders.detail(orderId),
      (old: Record<string, unknown> | undefined) => 
        old ? { ...old, ...updates } : undefined
    );
  },

  // Mark notification as read optimistically
  markNotificationRead: (notificationId: string) => {
    queryClient.setQueryData(
      queryKeys.notifications.detail(notificationId),
      (old: Record<string, unknown> | undefined) => 
        old ? { ...old, isRead: true } : undefined
    );
    queryClient.setQueryData(
      queryKeys.notifications.all,
      (old: Array<Record<string, unknown>> | undefined) => 
        old ? old.map((n) => n.id === notificationId ? { ...n, isRead: true } : n) : undefined
    );
  },

  // Remove notification optimistically
  removeNotification: (notificationId: string) => {
    queryClient.removeQueries({ queryKey: queryKeys.notifications.detail(notificationId) });
    queryClient.setQueryData(
      queryKeys.notifications.all,
      (old: Array<{ id: string }> | undefined) => 
        old ? old.filter((n) => n.id !== notificationId) : undefined
    );
  },
};

// Cache invalidation helpers
export const invalidateCache = {
  cases: () => queryClient.invalidateQueries({ queryKey: queryKeys.cases.all }),
  case: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.cases.detail(id) }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  documents: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.all }),
  documentsByCase: (caseId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.documents.byCase(caseId) }),
  motions: () => queryClient.invalidateQueries({ queryKey: queryKeys.motions.all }),
  motionsByCase: (caseId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.motions.byCase(caseId) }),
  motion: (id: number) => queryClient.invalidateQueries({ queryKey: queryKeys.motions.detail(id) }),
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  ordersByCase: (caseId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.orders.byCase(caseId) }),
  order: (id: number) => queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) }),
  calendar: () => queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all }),
  notifications: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  notification: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.detail(id) }),
  all: () => queryClient.invalidateQueries(),
};
