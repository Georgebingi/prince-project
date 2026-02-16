/**
 * TanStack Query hooks for motions management
 * Provides caching, optimistic updates, and prefetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateCache } from '../queryClient';
import { motionsApi } from '../services/api';

// Types
export interface Motion {
  id: number;
  caseId: string;
  caseNumber?: string;
  title: string;
  description?: string;
  status: string;
  documentUrl?: string;
  filedBy?: string;
  filedAt?: string;
  updatedAt?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface MotionFilters {
  status?: string;
  caseId?: string;
  page?: number;
  limit?: number;
}

export interface CreateMotionInput {
  caseId: string;
  title: string;
  description?: string;
  documentUrl?: string;
}

/**
 * Fetch motions with filters
 */
export function useMotions(filters: MotionFilters = {}) {
  return useQuery({
    queryKey: filters.caseId
      ? queryKeys.motions.byCase(filters.caseId)
      : queryKeys.motions.all,
    queryFn: async () => {
      const response = await motionsApi.getMotions(filters);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch motions');
      }
      return response.data as Motion[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch motions for a specific case
 */
export function useMotionsByCase(caseId: string) {
  return useQuery({
    queryKey: queryKeys.motions.byCase(caseId),
    queryFn: async () => {
      const response = await motionsApi.getMotions({ caseId });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch motions');
      }
      return response.data as Motion[];
    },
    enabled: !!caseId,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch pending motions
 */
export function usePendingMotions() {
  return useQuery({
    queryKey: queryKeys.motions.pending,
    queryFn: async () => {
      const response = await motionsApi.getMotions({ status: 'Pending' });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch pending motions');
      }
      return response.data as Motion[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch single motion by ID
 */
export function useMotion(id: number) {
  return useQuery({
    queryKey: queryKeys.motions.detail(id),
    queryFn: async () => {
      const response = await motionsApi.getMotions({});
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch motion');
      }
      const motion = (response.data as Motion[])?.find(m => m.id === id);
      if (!motion) {
        throw new Error('Motion not found');
      }
      return motion;
    },
    enabled: !!id,
  });
}

/**
 * Create motion with optimistic update
 */
export function useCreateMotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (motionData: CreateMotionInput) => {
      const response = await motionsApi.createMotion(motionData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create motion');
      }
      return response.data as Motion;
    },
    onMutate: async (motionData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.motions.all });
      if (motionData.caseId) {
        await queryClient.cancelQueries({ queryKey: queryKeys.motions.byCase(motionData.caseId) });
      }

      // Snapshot previous values
      const previousMotions = queryClient.getQueryData<Motion[]>(queryKeys.motions.all);
      const previousCaseMotions = motionData.caseId 
        ? queryClient.getQueryData<Motion[]>(queryKeys.motions.byCase(motionData.caseId))
        : undefined;

      // Create optimistic motion
      const optimisticMotion: Motion = {
        id: Date.now(),
        caseId: motionData.caseId,
        title: motionData.title,
        description: motionData.description,
        status: 'Pending',
        documentUrl: motionData.documentUrl,
        filedAt: new Date().toISOString(),
      };

      // Optimistically add motion to all lists
      queryClient.setQueryData<Motion[]>(queryKeys.motions.all, (old) => {
        return old ? [optimisticMotion, ...old] : [optimisticMotion];
      });

      if (motionData.caseId) {
        queryClient.setQueryData<Motion[]>(queryKeys.motions.byCase(motionData.caseId), (old) => {
          return old ? [optimisticMotion, ...old] : [optimisticMotion];
        });
      }

      return { previousMotions, previousCaseMotions, caseId: motionData.caseId };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousMotions) {
        queryClient.setQueryData(queryKeys.motions.all, context.previousMotions);
      }
      if (context?.previousCaseMotions && context.caseId) {
        queryClient.setQueryData(
          queryKeys.motions.byCase(context.caseId), 
          context.previousCaseMotions
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.motions();
      if (variables.caseId) {
        invalidateCache.motionsByCase(variables.caseId);
      }
    },
  });
}

/**
 * Update motion status with optimistic update
 */
export function useUpdateMotionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: number; 
      status: 'Approved' | 'Rejected'; 
      notes?: string;
    }) => {
      const response = await motionsApi.updateMotionStatus(id, status, notes);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update motion status');
      }
      return response.data;
    },
    onMutate: async ({ id, status, notes }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.motions.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.motions.pending });

      // Snapshot previous values
      const previousMotion = queryClient.getQueryData<Motion>(queryKeys.motions.detail(id));
      const previousPendingMotions = queryClient.getQueryData<Motion[]>(queryKeys.motions.pending);

      // Optimistically update motion status
      queryClient.setQueryData<Motion>(queryKeys.motions.detail(id), (old) => {
        return old ? { ...old, status, notes } : old;
      });

      // Remove from pending if status changed from Pending
      if (previousPendingMotions) {
        queryClient.setQueryData<Motion[]>(queryKeys.motions.pending, (old) => {
          return old ? old.filter(m => m.id !== id) : [];
        });
      }

      return { previousMotion, previousPendingMotions };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousMotion) {
        queryClient.setQueryData(queryKeys.motions.detail(_variables.id), context.previousMotion);
      }
      if (context?.previousPendingMotions) {
        queryClient.setQueryData(queryKeys.motions.pending, context.previousPendingMotions);
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.motion(variables.id);
      invalidateCache.motions();
      queryClient.invalidateQueries({ queryKey: queryKeys.motions.pending });
    },
  });
}

/**
 * Prefetch motions for a case
 */
export function usePrefetchMotions() {
  const queryClient = useQueryClient();

  return (caseId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.motions.byCase(caseId),
      queryFn: async () => {
        const response = await motionsApi.getMotions({ caseId });
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
