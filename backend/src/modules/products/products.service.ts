import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import type { ProductCreateInput, ProductUpdateInput } from './products.schemas';

export async function listProducts(
  userId: string,
  filters: { search?: string; categoryId?: string },
) {
  return prisma.product.findMany({
    where: {
      userId,
      categoryId: filters.categoryId,
      name: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
    },
    include: { category: true },
    orderBy: { name: 'asc' },
  });
}

export async function createProduct(userId: string, data: ProductCreateInput) {
  if (data.categoryId) {
    await assertOwnedCategory(userId, data.categoryId);
  }
  return prisma.product.create({ data: { ...data, userId }, include: { category: true } });
}

export async function getProduct(userId: string, id: string) {
  const product = await prisma.product.findFirst({
    where: { id, userId },
    include: { category: true },
  });
  if (!product) {
    throw new AppError(404, 'Продукт не найден');
  }
  return product;
}

export async function updateProduct(userId: string, id: string, data: ProductUpdateInput) {
  await getProduct(userId, id);
  if (data.categoryId) {
    await assertOwnedCategory(userId, data.categoryId);
  }
  return prisma.product.update({ where: { id }, data, include: { category: true } });
}

export async function deleteProduct(userId: string, id: string) {
  await getProduct(userId, id);
  await prisma.product.delete({ where: { id } });
}

// Объединение дубликатов: все позиции чеков с sourceId переносятся на targetProductId,
// после чего продукт-дубликат удаляется.
export async function mergeProducts(userId: string, sourceId: string, targetProductId: string) {
  if (sourceId === targetProductId) {
    throw new AppError(400, 'Нельзя объединить продукт с самим собой');
  }

  await getProduct(userId, sourceId);
  await getProduct(userId, targetProductId);

  await prisma.$transaction([
    prisma.purchaseItem.updateMany({
      where: { productId: sourceId },
      data: { productId: targetProductId },
    }),
    prisma.product.delete({ where: { id: sourceId } }),
  ]);

  return getProduct(userId, targetProductId);
}

// Подсказка для автозаполнения формы ввода чека по последней покупке этого продукта
export async function getLastPurchaseInfo(userId: string, productId: string) {
  await getProduct(userId, productId);

  const lastItem = await prisma.purchaseItem.findFirst({
    where: { productId, purchase: { userId } },
    orderBy: { purchase: { purchaseDate: 'desc' } },
    include: { purchase: { include: { store: true } } },
  });

  if (!lastItem) {
    return null;
  }

  return {
    storeId: lastItem.purchase.storeId,
    storeName: lastItem.purchase.store.name,
    volumePerPack: lastItem.volumePerPack,
    volumeUnit: lastItem.volumeUnit,
    pricePerPack: lastItem.pricePerPack,
    purchaseDate: lastItem.purchase.purchaseDate,
  };
}

async function assertOwnedCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw new AppError(404, 'Категория не найдена');
  }
}
