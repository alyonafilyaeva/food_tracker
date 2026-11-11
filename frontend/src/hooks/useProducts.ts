import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LastPurchaseInfo, Product, Unit } from '@/lib/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products'),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; defaultUnit: Unit; categoryId?: string | null }) =>
      api.post<Product>('/products', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export async function fetchLastPurchaseInfo(productId: string) {
  return api.get<LastPurchaseInfo | null>(`/products/${productId}/last-purchase`);
}
