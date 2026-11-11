import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import type { StoreCreateInput, StoreUpdateInput } from './stores.schemas';

export async function listStores(userId: string) {
  return prisma.store.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}

export async function createStore(userId: string, data: StoreCreateInput) {
  return prisma.store.create({ data: { ...data, userId } });
}

export async function getStore(userId: string, id: string) {
  const store = await prisma.store.findFirst({ where: { id, userId } });
  if (!store) {
    throw new AppError(404, 'Магазин не найден');
  }
  return store;
}

export async function updateStore(userId: string, id: string, data: StoreUpdateInput) {
  await getStore(userId, id);
  return prisma.store.update({ where: { id }, data });
}

export async function deleteStore(userId: string, id: string) {
  await getStore(userId, id);
  await prisma.store.delete({ where: { id } });
}
