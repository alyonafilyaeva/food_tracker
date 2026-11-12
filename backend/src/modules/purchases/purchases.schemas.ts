import { z } from 'zod';

const unitEnum = z.enum(['KG', 'G', 'L', 'ML', 'PCS']);
const fulfillmentEnum = z.enum(['IN_STORE', 'DELIVERY', 'PICKUP']);

export const purchaseItemInputSchema = z.object({
  productId: z.string().uuid(),
  packsCount: z.number().positive(),
  volumePerPack: z.number().positive(),
  volumeUnit: unitEnum,
  pricePerPack: z.number().nonnegative(),
});

export const purchaseCreateSchema = z.object({
  storeId: z.string().uuid(),
  purchaseDate: z.coerce.date(),
  fulfillmentType: fulfillmentEnum,
  deliveryFee: z.number().nonnegative().optional(),
  serviceFee: z.number().nonnegative().optional(),
  tips: z.number().nonnegative().optional(),
  bagFee: z.number().nonnegative().optional(),
  promoDiscount: z.number().nonnegative().optional(),
  items: z.array(purchaseItemInputSchema).min(1, 'Должна быть хотя бы одна позиция'),
});

// Для MVP обновление чека полностью заменяет список позиций — проще и достаточно для ручного ввода
export const purchaseUpdateSchema = purchaseCreateSchema;

export const purchaseListQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  storeId: z.string().uuid().optional(),
  fulfillmentType: fulfillmentEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type PurchaseItemInput = z.infer<typeof purchaseItemInputSchema>;
export type PurchaseCreateInput = z.infer<typeof purchaseCreateSchema>;
export type PurchaseListQuery = z.infer<typeof purchaseListQuerySchema>;
