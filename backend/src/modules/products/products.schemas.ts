import { z } from 'zod';

const unitEnum = z.enum(['KG', 'G', 'L', 'ML', 'PCS']);

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  categoryId: z.string().uuid().optional().nullable(),
  defaultUnit: unitEnum,
});

export const productUpdateSchema = productCreateSchema.partial();

export const productListQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
});

export const mergeProductsSchema = z.object({
  targetProductId: z.string().uuid(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
