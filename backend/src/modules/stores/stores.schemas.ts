import { z } from 'zod';

export const storeCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  storeType: z.enum(['OFFLINE', 'ONLINE', 'HYBRID']).default('OFFLINE'),
  hasDelivery: z.boolean().default(false),
  deliveryPlatform: z.string().min(1).optional().nullable(),
});

export const storeUpdateSchema = storeCreateSchema.partial();

export type StoreCreateInput = z.infer<typeof storeCreateSchema>;
export type StoreUpdateInput = z.infer<typeof storeUpdateSchema>;
