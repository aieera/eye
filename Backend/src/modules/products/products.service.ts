import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import type { CreateProductInput, UpdateProductInput, ListProductsQuery, UpdatePricesInput, BulkCreateInput } from './products.schema';
import { Prisma } from '@prisma/client';

export async function list(query: ListProductsQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where: any = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { externalItemCode: { contains: query.search } },
    ];
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.hasImage === true) {
    where.imageUrl = { not: null };
    where.hasValidImage = true;
  } else if (query.hasImage === false) {
    where.OR = where.OR || [];
    // Override OR for hasImage filter when no search
    if (!query.search) {
      where.OR = [
        { imageUrl: null },
        { hasValidImage: false },
      ];
    }
  }

  const include: any = {
    category: { select: { id: true, name: true } },
  };

  if (query.locationId) {
    include.prices = {
      where: { locationId: query.locationId },
      include: { location: { select: { id: true, name: true } } },
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      prices: {
        include: { location: { select: { id: true, name: true } } },
      },
      offers: {
        where: { isActive: true, endDate: { gte: new Date() } },
        select: { id: true, name: true, offerPrice: true, startDate: true, endDate: true },
      },
    },
  });

  if (!product) {
    throw AppError.notFound('Product not found');
  }

  return product;
}

export async function create(data: CreateProductInput) {
  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw AppError.notFound('Category not found');
    }
  }

  const product = await prisma.product.create({
    data: {
      externalItemCode: data.externalItemCode,
      name: data.name,
      shortName: data.shortName,
      description: data.description,
      dept: data.dept,
      classCode: data.classCode,
      subclass: data.subclass,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      hasValidImage: !!data.imageUrl,
      uom: data.uom,
      isActive: data.isActive ?? true,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return product;
}

export async function update(id: string, data: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Product not found');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw AppError.notFound('Category not found');
    }
  }

  const updateData: any = { ...data };
  if (data.imageUrl !== undefined && data.imageUrl !== null) {
    updateData.hasValidImage = true;
  } else if (data.imageUrl === null) {
    updateData.hasValidImage = false;
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return product;
}

export async function remove(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Product not found');
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
}

export async function getByItemCode(itemCode: string) {
  return prisma.product.findUnique({ where: { externalItemCode: itemCode } });
}

export async function updateImage(id: string, imageUrl: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Product not found');
  }

  return prisma.product.update({
    where: { id },
    data: { imageUrl, hasValidImage: true },
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function removeImage(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Product not found');
  }

  return prisma.product.update({
    where: { id },
    data: { imageUrl: null, hasValidImage: false },
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function updatePrices(productId: string, input: UpdatePricesInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw AppError.notFound('Product not found');
  }

  for (const price of input.prices) {
    const location = await prisma.location.findUnique({ where: { id: price.locationId } });
    if (!location) {
      throw AppError.notFound(`Location ${price.locationId} not found`);
    }

    await prisma.productPrice.upsert({
      where: {
        productId_locationId: { productId, locationId: price.locationId },
      },
      create: {
        productId,
        locationId: price.locationId,
        unitRetail: new Prisma.Decimal(price.unitRetail),
        sellingUnitRetail: price.sellingUnitRetail ? new Prisma.Decimal(price.sellingUnitRetail) : null,
        sellingUom: price.sellingUom,
        currency: price.currency || 'AED',
      },
      update: {
        unitRetail: new Prisma.Decimal(price.unitRetail),
        sellingUnitRetail: price.sellingUnitRetail ? new Prisma.Decimal(price.sellingUnitRetail) : null,
        sellingUom: price.sellingUom,
        currency: price.currency || 'AED',
      },
    });
  }

  return prisma.productPrice.findMany({
    where: { productId },
    include: { location: { select: { id: true, name: true } } },
  });
}

export async function bulkUpsert(input: BulkCreateInput) {
  let created = 0;
  let updated = 0;
  let failed = 0;
  const errors: { itemCode: string; error: string }[] = [];

  const batchSize = 100;
  for (let i = 0; i < input.products.length; i += batchSize) {
    const batch = input.products.slice(i, i + batchSize);

    for (const productData of batch) {
      try {
        const existing = await prisma.product.findUnique({
          where: { externalItemCode: productData.externalItemCode },
        });

        if (existing) {
          await prisma.product.update({
            where: { externalItemCode: productData.externalItemCode },
            data: {
              name: productData.name,
              shortName: productData.shortName,
              description: productData.description,
              dept: productData.dept,
              classCode: productData.classCode,
              subclass: productData.subclass,
              categoryId: productData.categoryId || null,
              uom: productData.uom,
            },
          });
          updated++;
        } else {
          await prisma.product.create({
            data: {
              externalItemCode: productData.externalItemCode,
              name: productData.name,
              shortName: productData.shortName,
              description: productData.description,
              dept: productData.dept,
              classCode: productData.classCode,
              subclass: productData.subclass,
              categoryId: productData.categoryId || null,
              imageUrl: productData.imageUrl || null,
              videoUrl: productData.videoUrl || null,
              hasValidImage: !!productData.imageUrl,
              uom: productData.uom,
              isActive: productData.isActive ?? true,
            },
          });
          created++;
        }
      } catch (err: any) {
        failed++;
        errors.push({ itemCode: productData.externalItemCode, error: err.message });
      }
    }
  }

  return { created, updated, failed, errors };
}

export async function getProductsWithoutImages(query: { page?: any; limit?: any }) {
  const { page, limit, skip } = parsePagination(query);

  const where = { hasValidImage: false, isActive: true };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getProductPrices(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw AppError.notFound('Product not found');
  }

  return prisma.productPrice.findMany({
    where: { productId },
    include: { location: { select: { id: true, name: true } } },
  });
}
