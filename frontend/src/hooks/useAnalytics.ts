import { useQuery } from '@tanstack/react-query';
import { api, buildQuery } from '@/lib/api';
import type {
  AverageCheckRow,
  SpendingBreakdown,
  SpendingOverTimeRow,
  StoreComparisonRow,
  TopProductRow,
} from '@/lib/types';

export interface DateRange {
  from?: string;
  to?: string;
  [key: string]: string | undefined;
}

export function useTopProducts(
  range: DateRange,
  groupBy: 'product' | 'category',
  limit = 10,
) {
  return useQuery({
    queryKey: ['analytics', 'top-products', range, groupBy, limit],
    queryFn: () =>
      api.get<TopProductRow[]>(
        `/analytics/top-products${buildQuery({ ...range, groupBy, limit })}`,
      ),
  });
}

export function useStoreComparison(productId: string | null) {
  return useQuery({
    queryKey: ['analytics', 'store-comparison', productId],
    queryFn: () =>
      api.get<StoreComparisonRow[]>(`/analytics/store-comparison${buildQuery({ productId: productId! })}`),
    enabled: Boolean(productId),
  });
}

export function useSpendingOverTime(range: DateRange, interval: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: ['analytics', 'spending-over-time', range, interval],
    queryFn: () =>
      api.get<SpendingOverTimeRow[]>(
        `/analytics/spending-over-time${buildQuery({ ...range, interval })}`,
      ),
  });
}

export function useSpendingBreakdown(range: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'spending-breakdown', range],
    queryFn: () => api.get<SpendingBreakdown>(`/analytics/spending-breakdown${buildQuery(range)}`),
  });
}

export function useAverageCheck(range: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'average-check', range],
    queryFn: () => api.get<AverageCheckRow[]>(`/analytics/average-check${buildQuery(range)}`),
  });
}
