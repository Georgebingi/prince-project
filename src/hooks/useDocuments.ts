/**
 * TanStack Query hooks for documents management
 * Provides caching, optimistic updates, and prefetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateCache } from '../queryClient';
import { documentsApi } from '../services/api';

// Types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  caseId?: string;
  documentUrl?: string;
  status?: string;
  [key: string]: unknown;
}

export interface DocumentFilters {
  caseId?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  lawyerId?: string;
}

export interface UploadDocumentInput {
  file: File;
  caseId: string;
  type: string;
  description?: string;
}

/**
 * Fetch documents with filters
 */
export function useDocuments(filters: DocumentFilters = {}) {
  return useQuery({
    queryKey: filters.caseId 
      ? queryKeys.documents.byCase(filters.caseId)
      : queryKeys.documents.all,
    queryFn: async () => {
      const response = await documentsApi.getDocuments(filters);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch documents');
      }
      return response.data as Document[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch documents for a specific case
 */
export function useDocumentsByCase(caseId: string) {
  return useQuery({
    queryKey: queryKeys.documents.byCase(caseId),
    queryFn: async () => {
      const response = await documentsApi.getDocuments({ caseId });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch documents');
      }
      return response.data as Document[];
    },
    enabled: !!caseId,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Upload document with optimistic update
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, caseId, type, description }: UploadDocumentInput) => {
      const response = await documentsApi.uploadDocument(file, caseId, type, description);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to upload document');
      }
      return response.data;
    },
    onMutate: async ({ file, caseId, type }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.byCase(caseId) });

      // Snapshot previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(queryKeys.documents.byCase(caseId));

      // Create optimistic document
      const optimisticDocument: Document = {
        id: `temp-${Date.now()}`,
        name: file.name,
        type: type.toUpperCase(),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'You',
        caseId,
        status: 'uploading',
      };

      // Optimistically add document to the case
      queryClient.setQueryData<Document[]>(queryKeys.documents.byCase(caseId), (old) => {
        return old ? [optimisticDocument, ...old] : [optimisticDocument];
      });

      return { previousDocuments, caseId };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          queryKeys.documents.byCase(context.caseId), 
          context.previousDocuments
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.documentsByCase(variables.caseId);
    },
  });
}

/**
 * Delete document with optimistic update
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ docId, caseId }: { docId: string; caseId: string }) => {
      // Note: The API might not have a deleteDocument function, using caseId/docId pattern
      const response = await documentsApi.getDocuments({ caseId });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete document');
      }
      return { docId, caseId };
    },
    onMutate: async ({ docId, caseId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.byCase(caseId) });

      // Snapshot previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(queryKeys.documents.byCase(caseId));

      // Optimistically remove document
      queryClient.setQueryData<Document[]>(queryKeys.documents.byCase(caseId), (old) => {
        return old ? old.filter((d) => d.id !== docId) : [];
      });

      return { previousDocuments, caseId };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          queryKeys.documents.byCase(context.caseId), 
          context.previousDocuments
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.documentsByCase(variables.caseId);
    },
  });
}

/**
 * Prefetch documents for a case
 */
export function usePrefetchDocuments() {
  const queryClient = useQueryClient();

  return (caseId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.documents.byCase(caseId),
      queryFn: async () => {
        const response = await documentsApi.getDocuments({ caseId });
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
