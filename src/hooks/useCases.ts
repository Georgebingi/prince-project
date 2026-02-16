/**
 * TanStack Query hooks for cases management
 * Provides caching, optimistic updates, and prefetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, optimisticUpdates, invalidateCache } from '../queryClient';
import { casesApi } from '../services/api';

// Types
export interface Case {
  id: string;
  title: string;
  status: string;
  type: string;
  filed: string;
  lawyer?: string;
  nextHearing?: string;

  [key: string]: unknown;
}

export interface CasesFilters {
  status?: string;
  type?: string;
  lawyer?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCaseInput {
  title: string;
  type: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface UpdateCaseInput {
  id: string;
  title?: string;
  status?: string;
  lawyer?: string;
  nextHearing?: string;
  [key: string]: string | undefined;
}

// Query hooks

/**
 * Fetch cases with filters
 */
export function useCases(filters: CasesFilters = {}) {
  return useQuery({
    queryKey: queryKeys.cases.lists(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await casesApi.getCases(filters);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch cases');
      }
      return response.data as Case[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch single case by ID
 */
export function useCase(id: string) {
  return useQuery({
    queryKey: queryKeys.cases.detail(id),
    queryFn: async () => {
      const response = await casesApi.getCaseById(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch case');
      }
      return response.data as Case;
    },
    enabled: !!id,
  });
}

/**
 * Create case with optimistic update
 */
export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCase: CreateCaseInput) => {
      const response = await casesApi.createCase(newCase);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create case');
      }
      return response.data as Case;
    },
    onMutate: async (newCase) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cases.all });

      // Snapshot previous value
      const previousCases = queryClient.getQueryData<Case[]>(queryKeys.cases.all);

      // Optimistically add new case
      const optimisticCase: Case = {
        ...newCase,
        id: `temp-${Date.now()}`,
        status: 'Pending',
        filed: new Date().toISOString(),
      };

      queryClient.setQueryData<Case[]>(queryKeys.cases.all, (old) => {
        return old ? [optimisticCase, ...old] : [optimisticCase];
      });

      return { previousCases };
    },
    onError: (_err, _newCase, context) => {
      // Rollback on error
      if (context?.previousCases) {
        queryClient.setQueryData(queryKeys.cases.all, context.previousCases);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      invalidateCache.cases();
    },
  });
}

/**
 * Update case with optimistic update
 */
export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCaseInput) => {
      const response = await casesApi.updateCase(id, updates);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update case');
      }
      return response.data as Case;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cases.detail(id) });

      const previousCase = queryClient.getQueryData<Case>(queryKeys.cases.detail(id));

      // Optimistically update
      optimisticUpdates.updateCase(id, updates);

      return { previousCase, id };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCase) {
        queryClient.setQueryData(queryKeys.cases.detail(context.id), context.previousCase);
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.case(variables.id);
    },
  });
}

/**
 * Delete case with optimistic update
 */
export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseId: string) => {
      const response = await casesApi.deleteCase(caseId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete case');
      }
      return caseId;
    },
    onMutate: async (caseId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cases.all });

      const previousCases = queryClient.getQueryData<Case[]>(queryKeys.cases.all);

      // Optimistically remove
      queryClient.setQueryData<Case[]>(queryKeys.cases.all, (old) => {
        return old ? old.filter((c) => c.id !== caseId) : [];
      });

      return { previousCases };
    },
    onError: (_err, _caseId, context) => {
      if (context?.previousCases) {
        queryClient.setQueryData(queryKeys.cases.all, context.previousCases);
      }
    },
    onSettled: () => {
      invalidateCache.cases();
    },
  });
}

/**
 * Assign lawyer to case with optimistic update
 */
export function useAssignLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, lawyerId }: { caseId: string; lawyerId: string }) => {
      const response = await casesApi.assignLawyerToCase(caseId, lawyerId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to assign lawyer');
      }
      return response.data;
    },
    onMutate: async ({ caseId, lawyerId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cases.detail(caseId) });

      // Snapshot previous value
      const previousCase = queryClient.getQueryData<Case>(queryKeys.cases.detail(caseId));

      // Optimistically update the case with the new lawyer
      queryClient.setQueryData<Case>(queryKeys.cases.detail(caseId), (old) => {
        return old ? { ...old, lawyer: lawyerId } : old;
      });

      return { previousCase, caseId };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCase) {
        queryClient.setQueryData(queryKeys.cases.detail(context.caseId), context.previousCase);
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.case(variables.caseId);
    },
  });
}

/**
 * Schedule hearing for case with optimistic update
 */
export function useScheduleHearing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caseId,
      hearingDate,
    }: {
      caseId: string;
      hearingDate: string;
    }) => {
      const response = await casesApi.scheduleHearing(caseId, hearingDate);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to schedule hearing');
      }
      return response.data;
    },
    onMutate: async ({ caseId, hearingDate }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cases.detail(caseId) });

      // Snapshot previous value
      const previousCase = queryClient.getQueryData<Case>(queryKeys.cases.detail(caseId));

      // Optimistically update the hearing date
      queryClient.setQueryData<Case>(queryKeys.cases.detail(caseId), (old) => {
        return old ? { ...old, nextHearing: hearingDate } : old;
      });

      return { previousCase, caseId };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCase) {
        queryClient.setQueryData(queryKeys.cases.detail(context.caseId), context.previousCase);
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.case(variables.caseId);
      invalidateCache.calendar();
    },
  });
}

/**
 * Request case assignment (for lawyers) with optimistic update
 */
export function useRequestCaseAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseId: string) => {
      const response = await casesApi.requestCaseAssignment(caseId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to request assignment');
      }
      return response.data;
    },
    onMutate: async (caseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cases.all });

      // Snapshot previous value
      const previousCases = queryClient.getQueryData<Case[]>(queryKeys.cases.all);

      // Optimistically update case status to show assignment requested
      queryClient.setQueryData<Case[]>(queryKeys.cases.all, (old) => {
        return old ? old.map((c) => 
          c.id === caseId ? { ...c, status: 'Assignment Requested' } : c
        ) : old;
      });

      return { previousCases };
    },
    onError: (_err, _caseId, context) => {
      // Rollback on error
      if (context?.previousCases) {
        queryClient.setQueryData(queryKeys.cases.all, context.previousCases);
      }
    },
    onSettled: () => {
      invalidateCache.cases();
    },
  });
}

// Prefetch hook for navigation
export function usePrefetchCase() {
  const queryClient = useQueryClient();

  return (caseId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.cases.detail(caseId),
      queryFn: async () => {
        const response = await casesApi.getCaseById(caseId);
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
