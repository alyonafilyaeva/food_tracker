import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, buildQuery } from '@/lib/api';
import type { FulfillmentType, Purchase, PurchaseInput, PurchaseListResult } from '@/lib/types';

interface PurchaseListFilters {
  from?: string;
  to?: string;
  storeId?: string;
  fulfillmentType?: FulfillmentType;
  page?: number;
  pageSize?: number;
  [key: string]: string | number | undefined;
}

export function usePurchases(filters: PurchaseListFilters = {}) {
  return useQuery({
    queryKey: ['purchases', filters],
    queryFn: () => api.get<PurchaseListResult>(`/purchases${buildQuery(filters)}`),
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ['purchases', 'detail', id],
    queryFn: () => api.get<Purchase>(`/purchases/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseInput) => api.post<Purchase>('/purchases', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseInput }) =>
      api.patch<Purchase>(`/purchases/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
