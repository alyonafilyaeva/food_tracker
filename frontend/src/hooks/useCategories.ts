import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => api.post<Category>('/categories', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}
