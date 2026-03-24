import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';

export async function assignImageToProduct(productId: string, imageUrl: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw AppError.notFound('Product not found');
  }

  return prisma.product.update({
    where: { id: productId },
    data: { imageUrl, hasValidImage: true },
  });
}

export async function assignImageToScreen(screenId: string, imageUrl: string) {
  const screen = await prisma.screen.findUnique({ where: { id: screenId } });
  if (!screen) {
    throw AppError.notFound('Screen not found');
  }

  return prisma.screen.update({
    where: { id: screenId },
    data: { image: imageUrl },
  });
}

export async function assignImageToOffer(offerId: string, imageUrl: string) {
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) {
    throw AppError.notFound('Offer not found');
  }

  return prisma.offer.update({
    where: { id: offerId },
    data: { imageUrl },
  });
}

export async function assignImage(entityType: string, entityId: string, url: string) {
  switch (entityType) {
    case 'product':
      return assignImageToProduct(entityId, url);
    case 'screen':
      return assignImageToScreen(entityId, url);
    case 'offer':
      return assignImageToOffer(entityId, url);
    default:
      throw AppError.badRequest(`Unknown entity type: ${entityType}`);
  }
}

export async function removeEntityImage(entityType: string, entityId: string) {
  switch (entityType) {
    case 'product': {
      const product = await prisma.product.findUnique({ where: { id: entityId } });
      if (!product) throw AppError.notFound('Product not found');
      return prisma.product.update({
        where: { id: entityId },
        data: { imageUrl: null, hasValidImage: false },
      });
    }
    case 'screen': {
      const screen = await prisma.screen.findUnique({ where: { id: entityId } });
      if (!screen) throw AppError.notFound('Screen not found');
      return prisma.screen.update({
        where: { id: entityId },
        data: { image: null },
      });
    }
    case 'offer': {
      const offer = await prisma.offer.findUnique({ where: { id: entityId } });
      if (!offer) throw AppError.notFound('Offer not found');
      return prisma.offer.update({
        where: { id: entityId },
        data: { imageUrl: null },
      });
    }
    default:
      throw AppError.badRequest(`Unknown entity type: ${entityType}`);
  }
}
