import { Decimal } from 'decimal.js';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { calcPurchaseItem } from '../../lib/unitConversion';
import type { Prisma } from '@prisma/client';
import type { PurchaseCreateInput, PurchaseListQuery } from './purchases.schemas';

const includeFull = {
  store: true,
  items: { include: { product: { include: { category: true } } } },
} satisfies Prisma.PurchaseInclude;

async function assertOwnedStore(userId: string, storeId: string) {
  const store = await prisma.store.findFirst({ where: { id: storeId, userId } });
  if (!store) {
    throw new AppError(404, 'Магазин не найден');
  }
}

async function assertOwnedProducts(userId: string, productIds: string[]) {
  const uniqueIds = [...new Set(productIds)];
  const count = await prisma.product.count({ where: { id: { in: uniqueIds }, userId } });
  if (count !== uniqueIds.length) {
    throw new AppError(404, 'Один из продуктов не найден');
  }
}

// Готовит данные позиций для записи в БД, вычисляя total_price и price_per_base_unit
function buildItemsData(items: PurchaseCreateInput['items']) {
  return items.map((item) => {
    const calc = calcPurchaseItem(item);
    return {
      productId: item.productId,
      packsCount: item.packsCount,
      volumePerPack: item.volumePerPack,
      volumeUnit: item.volumeUnit,
      pricePerPack: item.pricePerPack,
      totalPrice: calc.totalPrice.toFixed(2),
      pricePerBaseUnit: calc.pricePerBaseUnit.toFixed(4),
    };
  });
}

// original_amount = items_total + fees (до скидки); total_amount = original_amount - promo_discount
function calcTotals(
  itemsData: ReturnType<typeof buildItemsData>,
  fees: {
    deliveryFee?: number;
    serviceFee?: number;
    tips?: number;
    bagFee?: number;
    promoDiscount?: number;
  },
) {
  const itemsTotal = itemsData.reduce(
    (sum, item) => sum.plus(item.totalPrice),
    new Decimal(0),
  );
  const feesTotal = new Decimal(fees.deliveryFee ?? 0)
    .plus(fees.serviceFee ?? 0)
    .plus(fees.tips ?? 0)
    .plus(fees.bagFee ?? 0);
  const originalAmount = itemsTotal.plus(feesTotal);
  const totalAmount = originalAmount.minus(fees.promoDiscount ?? 0);

  return { itemsTotal, originalAmount, totalAmount };
}

export async function createPurchase(userId: string, input: PurchaseCreateInput) {
  await assertOwnedStore(userId, input.storeId);
  await assertOwnedProducts(userId, input.items.map((item) => item.productId));

  const itemsData = buildItemsData(input.items);
  const { itemsTotal, originalAmount, totalAmount } = calcTotals(itemsData, input);

  return prisma.purchase.create({
    data: {
      userId,
      storeId: input.storeId,
      purchaseDate: input.purchaseDate,
      fulfillmentType: input.fulfillmentType,
      deliveryFee: input.deliveryFee ?? null,
      serviceFee: input.serviceFee ?? null,
      tips: input.tips ?? null,
      bagFee: input.bagFee ?? null,
      promoDiscount: input.promoDiscount ?? null,
      itemsTotal: itemsTotal.toFixed(2),
      originalAmount: originalAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      items: { create: itemsData },
    },
    include: includeFull,
  });
}

export async function updatePurchase(userId: string, id: string, input: PurchaseCreateInput) {
  await getPurchase(userId, id);
  await assertOwnedStore(userId, input.storeId);
  await assertOwnedProducts(userId, input.items.map((item) => item.productId));

  const itemsData = buildItemsData(input.items);
  const { itemsTotal, originalAmount, totalAmount } = calcTotals(itemsData, input);

  return prisma.purchase.update({
    where: { id },
    data: {
      storeId: input.storeId,
      purchaseDate: input.purchaseDate,
      fulfillmentType: input.fulfillmentType,
      deliveryFee: input.deliveryFee ?? null,
      serviceFee: input.serviceFee ?? null,
      tips: input.tips ?? null,
      bagFee: input.bagFee ?? null,
      promoDiscount: input.promoDiscount ?? null,
      itemsTotal: itemsTotal.toFixed(2),
      originalAmount: originalAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      // Полная замена позиций — проще, чем сопоставлять diff при ручном вводе чека
      items: { deleteMany: {}, create: itemsData },
    },
    include: includeFull,
  });
}

export async function getPurchase(userId: string, id: string) {
  const purchase = await prisma.purchase.findFirst({
    where: { id, userId },
    include: includeFull,
  });
  if (!purchase) {
    throw new AppError(404, 'Покупка не найдена');
  }
  return purchase;
}

export async function deletePurchase(userId: string, id: string) {
  await getPurchase(userId, id);
  await prisma.purchase.delete({ where: { id } });
}

export async function listPurchases(userId: string, filters: PurchaseListQuery) {
  const where: Prisma.PurchaseWhereInput = {
    userId,
    storeId: filters.storeId,
    fulfillmentType: filters.fulfillmentType,
    purchaseDate: {
      gte: filters.from,
      lte: filters.to,
    },
  };

  const [total, data] = await Promise.all([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      orderBy: { purchaseDate: 'desc' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: includeFull,
    }),
  ]);

  return { total, page: filters.page, pageSize: filters.pageSize, data };
}
