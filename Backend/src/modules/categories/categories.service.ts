import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import type { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from './categories.schema';

export async function list(query: ListCategoriesQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where: any = {};

  if (query.search) {
    where.name = { contains: query.search };
  }

  if (query.level) {
    where.level = query.level;
  }

  if (query.parentId !== undefined) {
    where.parentId = query.parentId;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true, children: true } },
      },
    }),
    prisma.category.count({ where }),
  ]);

  return { categories, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true, level: true } },
      children: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: { _count: { select: { products: true, children: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    throw AppError.notFound('Category not found');
  }

  return category;
}

interface TreeNode {
  id: string;
  name: string;
  level: string;
  oracleDept: string | null;
  oracleClass: string | null;
  oracleSubclass: string | null;
  displayOrder: number;
  productCount: number;
  children: TreeNode[];
}

export async function getTree() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  });

  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Build nodes
  for (const cat of categories) {
    nodeMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      level: cat.level,
      oracleDept: cat.oracleDept,
      oracleClass: cat.oracleClass,
      oracleSubclass: cat.oracleSubclass,
      displayOrder: cat.displayOrder,
      productCount: cat._count.products,
      children: [],
    });
  }

  // Link children
  for (const cat of categories) {
    const node = nodeMap.get(cat.id)!;
    if (cat.parentId && nodeMap.has(cat.parentId)) {
      nodeMap.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function create(data: CreateCategoryInput) {
  if (data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw AppError.notFound('Parent category not found');
    }
  }

  if (data.level === 'class' && !data.parentId) {
    throw AppError.badRequest('Class-level category requires a parent department');
  }

  if (data.level === 'subclass' && !data.parentId) {
    throw AppError.badRequest('Subclass-level category requires a parent class');
  }

  return prisma.category.create({
    data: {
      name: data.name,
      oracleDept: data.oracleDept || null,
      oracleClass: data.oracleClass || null,
      oracleSubclass: data.oracleSubclass || null,
      parentId: data.parentId || null,
      level: data.level,
      displayOrder: data.displayOrder,
    },
    include: { _count: { select: { products: true, children: true } } },
  });
}

export async function update(id: string, data: UpdateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Category not found');
  }

  if (data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw AppError.notFound('Parent category not found');
    }
  }

  return prisma.category.update({
    where: { id },
    data,
    include: { _count: { select: { products: true, children: true } } },
  });
}

export async function remove(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: { where: { isActive: true } }, children: true } } },
  });

  if (!existing) {
    throw AppError.notFound('Category not found');
  }

  if (existing._count.products > 0) {
    throw AppError.badRequest('Cannot delete category with assigned products. Reassign products first.');
  }

  if (existing._count.children > 0) {
    throw AppError.badRequest('Cannot delete category with subcategories. Delete subcategories first.');
  }

  await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function getByOracleCode(dept: string, classCode?: string, subclass?: string) {
  return prisma.category.findFirst({
    where: {
      oracleDept: dept,
      oracleClass: classCode || null,
      oracleSubclass: subclass || null,
    },
  });
}
