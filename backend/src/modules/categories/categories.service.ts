import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import type { CategoryCreateInput, CategoryUpdateInput } from './categories.schemas';

export async function listCategories(userId: string) {
  return prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}

export async function createCategory(userId: string, data: CategoryCreateInput) {
  return prisma.category.create({ data: { ...data, userId } });
}

export async function getCategory(userId: string, id: string) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) {
    throw new AppError(404, 'Категория не найдена');
  }
  return category;
}

export async function updateCategory(userId: string, id: string, data: CategoryUpdateInput) {
  await getCategory(userId, id);
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(userId: string, id: string) {
  await getCategory(userId, id);
  // Продукты не удаляются, category_id у них просто становится null (onDelete: SetNull в схеме)
  await prisma.category.delete({ where: { id } });
}
