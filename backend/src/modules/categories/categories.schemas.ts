import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
