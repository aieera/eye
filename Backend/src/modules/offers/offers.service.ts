import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import type { CreateOfferInput, UpdateOfferInput, ListOffersQuery } from './offers.schema';
import { Prisma } from '@prisma/client';

export async function list(query: ListOffersQuery) {
  const { page, limit, skip } = parsePagination(query);
  const now = new Date();

  const where: any = {};

  if (query.search) {
    where.name = { contains: query.search };
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.productId) {
    where.productId = query.productId;
  }

  if (query.locationId) {
    where.locationId = query.locationId;
  }

  if (query.source) {
    where.source = query.source;
  }

  if (query.status === 'active') {
    where.startDate = { lte: now };
    where.endDate = { gte: now };
    where.isActive = true;
  } else if (query.status === 'expired') {
    where.endDate = { lt: now };
  } else if (query.status === 'upcoming') {
    where.startDate = { gt: now };
  }

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
        location: { select: { id: true, name: true } },
      },
    }),
    prisma.offer.count({ where }),
  ]);

  return { offers, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getById(id: string) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      product: {
        select: { id: true, name: true, imageUrl: true, externalItemCode: true },
        include: { category: { select: { id: true, name: true } } } as any,
      },
      location: { select: { id: true, name: true } },
    },
  });

  if (!offer) {
    throw AppError.notFound('Offer not found');
  }

  return offer;
}

export async function getActiveOffers(locationId?: string) {
  const now = new Date();
  const where: any = {
    isActive: true,
    startDate: { lte: now },
    endDate: { gte: now },
  };

  if (locationId) {
    where.locationId = locationId;
  }

  return prisma.offer.findMany({
    where,
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
      location: { select: { id: true, name: true } },
    },
    orderBy: { startDate: 'desc' },
  });
}

export async function create(data: CreateOfferInput) {
  if (data.productId) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      throw AppError.notFound('Product not found');
    }
  }

  if (data.locationId) {
    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) {
      throw AppError.notFound('Location not found');
    }
  }

  return prisma.offer.create({
    data: {
      name: data.name,
      title: data.title,
      description: data.description,
      productId: data.productId || null,
      locationId: data.locationId || null,
      originalPrice: data.originalPrice != null ? new Prisma.Decimal(data.originalPrice) : null,
      offerPrice: data.offerPrice != null ? new Prisma.Decimal(data.offerPrice) : null,
      discountPercentage: data.discountPercentage != null ? new Prisma.Decimal(data.discountPercentage) : null,
      imageUrl: data.imageUrl || null,
      source: data.source || 'manual',
      startDate: data.startDate,
      endDate: data.endDate,
    },
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
      location: { select: { id: true, name: true } },
    },
  });
}

export async function update(id: string, data: UpdateOfferInput) {
  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Offer not found');
  }

  const updateData: any = { ...data };

  // Convert decimal fields
  if (data.originalPrice !== undefined) {
    updateData.originalPrice = data.originalPrice != null ? new Prisma.Decimal(data.originalPrice) : null;
  }
  if (data.offerPrice !== undefined) {
    updateData.offerPrice = data.offerPrice != null ? new Prisma.Decimal(data.offerPrice) : null;
  }
  if (data.discountPercentage !== undefined) {
    updateData.discountPercentage = data.discountPercentage != null ? new Prisma.Decimal(data.discountPercentage) : null;
  }

  return prisma.offer.update({
    where: { id },
    data: updateData,
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
      location: { select: { id: true, name: true } },
    },
  });
}

export async function remove(id: string) {
  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Offer not found');
  }

  await prisma.offer.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
}

export async function expireOffers() {
  const now = new Date();
  const result = await prisma.offer.updateMany({
    where: {
      endDate: { lt: now },
      isActive: true,
    },
    data: { isActive: false },
  });

  return result.count;
}
