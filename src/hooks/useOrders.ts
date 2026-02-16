/**
 * TanStack Query hooks for orders management
 * Provides caching, optimistic updates, and prefetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateCache } from '../queryClient';

import { ordersApi } from '../services/api';

// Types
export interface Order {
  id: number;
  caseId: string;
  caseNumber?: string;
  title: string;
  content?: string;
  status: 'Draft' | 'Signed' | 'Executed';
  signedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface OrderFilters {
  status?: string;
  caseId?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderInput {
  caseId: string;
  title: string;
  content?: string;
}

/**
 * Fetch orders with filters
 */
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: filters.caseId
      ? queryKeys.orders.byCase(filters.caseId)
      : queryKeys.orders.all,
    queryFn: async () => {
      const response = await ordersApi.getOrders(filters);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch orders');
      }
      return response.data as Order[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch orders for a specific case
 */
export function useOrdersByCase(caseId: string) {
  return useQuery({
    queryKey: queryKeys.orders.byCase(caseId),
    queryFn: async () => {
      const response = await ordersApi.getOrders({ caseId });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch orders');
      }
      return response.data as Order[];
    },
    enabled: !!caseId,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch draft orders
 */
export function useDraftOrders() {
  return useQuery({
    queryKey: queryKeys.orders.draft,
    queryFn: async () => {
      const response = await ordersApi.getOrders({ status: 'Draft' });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch draft orders');
      }
      return response.data as Order[];
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch single order by ID
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: async () => {
      const response = await ordersApi.getOrders({});
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch order');
      }
      const order = (response.data as Order[])?.find(o => o.id === id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    },
    enabled: !!id,
  });
}

/**
 * Create order with optimistic update
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderInput) => {
      const response = await ordersApi.createOrder(orderData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create order');
      }
      return response.data as Order;
    },
    onMutate: async (orderData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });
      if (orderData.caseId) {
        await queryClient.cancelQueries({ queryKey: queryKeys.orders.byCase(orderData.caseId) });
      }

      // Snapshot previous values
      const previousOrders = queryClient.getQueryData<Order[]>(queryKeys.orders.all);
      const previousCaseOrders = orderData.caseId 
        ? queryClient.getQueryData<Order[]>(queryKeys.orders.byCase(orderData.caseId))
        : undefined;

      // Create optimistic order
      const optimisticOrder: Order = {
        id: Date.now(),
        caseId: orderData.caseId,
        title: orderData.title,
        content: orderData.content,
        status: 'Draft',
        createdAt: new Date().toISOString(),
      };

      // Optimistically add order to all lists
      queryClient.setQueryData<Order[]>(queryKeys.orders.all, (old) => {
        return old ? [optimisticOrder, ...old] : [optimisticOrder];
      });

      if (orderData.caseId) {
        queryClient.setQueryData<Order[]>(queryKeys.orders.byCase(orderData.caseId), (old) => {
          return old ? [optimisticOrder, ...old] : [optimisticOrder];
        });
      }

      return { previousOrders, previousCaseOrders, caseId: orderData.caseId };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders.all, context.previousOrders);
      }
      if (context?.previousCaseOrders && context.caseId) {
        queryClient.setQueryData(
          queryKeys.orders.byCase(context.caseId), 
          context.previousCaseOrders
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.orders();
      if (variables.caseId) {
        invalidateCache.ordersByCase(variables.caseId);
      }
    },
  });
}

/**
 * Sign order with optimistic update
 */
export function useSignOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await ordersApi.signOrder(orderId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to sign order');
      }
      return response.data;
    },
    onMutate: async (orderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.detail(orderId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.draft });

      // Snapshot previous values
      const previousOrder = queryClient.getQueryData<Order>(queryKeys.orders.detail(orderId));
      const previousDraftOrders = queryClient.getQueryData<Order[]>(queryKeys.orders.draft);

      // Optimistically update order status
      queryClient.setQueryData<Order>(queryKeys.orders.detail(orderId), (old) => {
        return old ? { ...old, status: 'Signed', signedAt: new Date().toISOString() } : old;
      });

      // Remove from draft if status changed
      if (previousDraftOrders) {
        queryClient.setQueryData<Order[]>(queryKeys.orders.draft, (old) => {
          return old ? old.filter(o => o.id !== orderId) : [];
        });
      }

      return { previousOrder, previousDraftOrders };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousOrder) {
        queryClient.setQueryData(queryKeys.orders.detail(_variables), context.previousOrder);
      }
      if (context?.previousDraftOrders) {
        queryClient.setQueryData(queryKeys.orders.draft, context.previousDraftOrders);
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateCache.order(variables);
      invalidateCache.orders();
    },
  });
}

/**
 * Prefetch orders for a case
 */
export function usePrefetchOrders() {
  const queryClient = useQueryClient();

  return (caseId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.orders.byCase(caseId),
      queryFn: async () => {
        const response = await ordersApi.getOrders({ caseId });
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
