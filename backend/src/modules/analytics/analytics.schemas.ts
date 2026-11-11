import { z } from 'zod';

export const dateRangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const topProductsQuerySchema = dateRangeQuerySchema.extend({
  limit: z.coerce.number().int().positive().max(100).default(10),
  groupBy: z.enum(['product', 'category']).default('product'),
});

export const storeComparisonQuerySchema = z.object({
  productId: z.string().uuid(),
});

export const spendingOverTimeQuerySchema = dateRangeQuerySchema.extend({
  interval: z.enum(['day', 'week', 'month']).default('month'),
});

export type TopProductsQuery = z.infer<typeof topProductsQuerySchema>;
export type SpendingOverTimeQuery = z.infer<typeof spendingOverTimeQuerySchema>;
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>;
