import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Store, StoreType } from '@/lib/types';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => api.get<Store[]>('/stores'),
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; storeType?: StoreType }) =>
      api.post<Store>('/stores', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  });
}
