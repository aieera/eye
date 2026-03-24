import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import type { CreateLocationInput, UpdateLocationInput, ListLocationsQuery } from './locations.schema';

export async function list(query: ListLocationsQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where: any = {};

  if (query.search) {
    where.name = { contains: query.search };
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [locations, total] = await Promise.all([
    prisma.location.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { screens: true } } },
    }),
    prisma.location.count({ where }),
  ]);

  return { locations, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getById(id: string) {
  const location = await prisma.location.findUnique({
    where: { id },
    include: { _count: { select: { screens: true } } },
  });

  if (!location) {
    throw AppError.notFound('Location not found');
  }

  return location;
}

export async function create(data: CreateLocationInput) {
  return prisma.location.create({ data });
}

export async function update(id: string, data: UpdateLocationInput) {
  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Location not found');
  }

  return prisma.location.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Location not found');
  }

  return prisma.location.update({
    where: { id },
    data: { isActive: false },
  });
}
