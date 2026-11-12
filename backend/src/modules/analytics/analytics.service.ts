import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { getBaseUnit } from '../../lib/unitConversion';
import type { DateRangeQuery, SpendingOverTimeQuery, TopProductsQuery } from './analytics.schemas';

// Postgres возвращает COUNT(*) как bigint, а NUMERIC — как строку.
// JSON.stringify не умеет сериализовать bigint, поэтому всё приводим к числу перед отдачей наружу.
function toNum(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

function dateFilter(from?: Date, to?: Date) {
  return Prisma.sql`AND p.purchase_date >= ${from ?? new Date('1970-01-01')} AND p.purchase_date <= ${to ?? new Date('2999-12-31')}`;
}

export async function getTopProducts(userId: string, query: TopProductsQuery) {
  const { from, to, limit, groupBy } = query;

  if (groupBy === 'category') {
    const rows = await prisma.$queryRaw<
      Array<{ id: string | null; name: string; totalSpent: string; itemsCount: bigint }>
    >`
      SELECT c.id as id, COALESCE(c.name, 'Без категории') as name,
             SUM(pi.total_price) as "totalSpent",
             COUNT(pi.id) as "itemsCount"
      FROM purchase_items pi
      JOIN purchases p ON p.id = pi.purchase_id
      JOIN products pr ON pr.id = pi.product_id
      LEFT JOIN categories c ON c.id = pr.category_id
      WHERE p.user_id = ${userId} ${dateFilter(from, to)}
      GROUP BY c.id, c.name
      ORDER BY "totalSpent" DESC
      LIMIT ${limit}
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      totalSpent: toNum(row.totalSpent),
      itemsCount: toNum(row.itemsCount),
    }));
  }

  const rows = await prisma.$queryRaw<
    Array<{ id: string; name: string; totalSpent: string; itemsCount: bigint }>
  >`
    SELECT pr.id as id, pr.name as name,
           SUM(pi.total_price) as "totalSpent",
           COUNT(pi.id) as "itemsCount"
    FROM purchase_items pi
    JOIN purchases p ON p.id = pi.purchase_id
    JOIN products pr ON pr.id = pi.product_id
    WHERE p.user_id = ${userId} ${dateFilter(from, to)}
    GROUP BY pr.id, pr.name
    ORDER BY "totalSpent" DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    totalSpent: toNum(row.totalSpent),
    itemsCount: toNum(row.itemsCount),
  }));
}

// Сравнение цен на конкретный продукт по магазинам — средневзвешенная цена за базовую единицу
// (сумма потраченного / сумма объёма в базовых единицах), без учёта delivery_fee/service_fee/tips
export async function getStoreComparison(userId: string, productId: string) {
  const rows = await prisma.$queryRaw<
    Array<{
      storeId: string;
      storeName: string;
      spent: string;
      baseQty: string;
      purchaseCount: bigint;
      lastPurchaseDate: Date;
    }>
  >`
    SELECT s.id as "storeId", s.name as "storeName",
           SUM(pi.total_price) as spent,
           SUM(pi.total_price / pi.price_per_base_unit) as "baseQty",
           COUNT(DISTINCT p.id) as "purchaseCount",
           MAX(p.purchase_date) as "lastPurchaseDate"
    FROM purchase_items pi
    JOIN purchases p ON p.id = pi.purchase_id
    JOIN stores s ON s.id = p.store_id
    WHERE p.user_id = ${userId} AND pi.product_id = ${productId}
    GROUP BY s.id, s.name
    ORDER BY spent DESC
  `;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { defaultUnit: true },
  });
  const baseUnit = product ? getBaseUnit(product.defaultUnit) : 'PCS';

  return rows.map((row) => ({
    storeId: row.storeId,
    storeName: row.storeName,
    purchaseCount: toNum(row.purchaseCount),
    lastPurchaseDate: row.lastPurchaseDate,
    avgPricePerBaseUnit: toNum(row.spent) / toNum(row.baseQty),
    baseUnit,
  }));
}

export async function getSpendingOverTime(userId: string, query: SpendingOverTimeQuery) {
  const { from, to, interval } = query;
  const rows = await prisma.$queryRaw<
    Array<{ bucket: Date; itemsTotal: string; totalAmount: string }>
  >`
    SELECT date_trunc(${interval}, p.purchase_date) as bucket,
           SUM(p.items_total) as "itemsTotal",
           SUM(p.total_amount) as "totalAmount"
    FROM purchases p
    WHERE p.user_id = ${userId} ${dateFilter(from, to)}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;
  return rows.map((row) => ({
    bucket: row.bucket,
    itemsTotal: toNum(row.itemsTotal),
    totalAmount: toNum(row.totalAmount),
  }));
}

// Разбивка трат: товары vs доставка/сервисный сбор/чаевые/пакеты/скидки
export async function getSpendingBreakdown(userId: string, query: DateRangeQuery) {
  const { from, to } = query;
  const [row] = await prisma.$queryRaw<
    Array<{
      itemsTotal: string;
      deliveryFee: string;
      serviceFee: string;
      tips: string;
      bagFee: string;
      promoDiscount: string;
    }>
  >`
    SELECT COALESCE(SUM(p.items_total), 0) as "itemsTotal",
           COALESCE(SUM(p.delivery_fee), 0) as "deliveryFee",
           COALESCE(SUM(p.service_fee), 0) as "serviceFee",
           COALESCE(SUM(p.tips), 0) as "tips",
           COALESCE(SUM(p.bag_fee), 0) as "bagFee",
           COALESCE(SUM(p.promo_discount), 0) as "promoDiscount"
    FROM purchases p
    WHERE p.user_id = ${userId} ${dateFilter(from, to)}
  `;

  return {
    itemsTotal: toNum(row.itemsTotal),
    deliveryFee: toNum(row.deliveryFee),
    serviceFee: toNum(row.serviceFee),
    tips: toNum(row.tips),
    bagFee: toNum(row.bagFee),
    promoDiscount: toNum(row.promoDiscount),
  };
}

export async function getAverageCheck(userId: string, query: DateRangeQuery) {
  const { from, to } = query;
  const rows = await prisma.$queryRaw<
    Array<{ fulfillmentType: string; avgTotal: string; count: bigint }>
  >`
    SELECT p.fulfillment_type as "fulfillmentType",
           AVG(p.total_amount) as "avgTotal",
           COUNT(*) as count
    FROM purchases p
    WHERE p.user_id = ${userId} ${dateFilter(from, to)}
    GROUP BY p.fulfillment_type
  `;
  return rows.map((row) => ({
    fulfillmentType: row.fulfillmentType,
    avgTotal: toNum(row.avgTotal),
    count: toNum(row.count),
  }));
}
