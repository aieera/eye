import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import { createSystemLog } from '../logs/logs.service';
import type {
  CreatePlaylistInput, UpdatePlaylistInput, ListPlaylistsQuery,
  AddPlaylistItemInput, UpdatePlaylistItemInput, ReorderItemsInput,
} from './playlists.schema';

const playlistInclude = {
  location: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  _count: { select: { items: true } },
};

const itemInclude = {
  product: {
    select: { id: true, externalItemCode: true, name: true, imageUrl: true, hasValidImage: true },
  },
  offer: {
    select: { id: true, name: true, title: true, originalPrice: true, offerPrice: true, discountPercentage: true, imageUrl: true },
  },
};

export async function list(query: ListPlaylistsQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where: any = {};

  if (query.search) {
    where.name = { contains: query.search };
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.locationId) {
    where.locationId = query.locationId;
  }
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [playlists, total] = await Promise.all([
    prisma.playlist.findMany({
      where, skip, take: limit,
      orderBy: { updatedAt: 'desc' },
      include: playlistInclude,
    }),
    prisma.playlist.count({ where }),
  ]);

  return { playlists, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getById(id: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      ...playlistInclude,
      items: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: itemInclude,
      },
    },
  });

  if (!playlist) {
    throw AppError.notFound('Playlist not found');
  }
  return playlist;
}

export async function create(data: CreatePlaylistInput, createdById: string) {
  if (data.locationId) {
    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) throw AppError.notFound('Location not found');
  }

  return prisma.playlist.create({
    data: {
      name: data.name,
      description: data.description,
      locationId: data.locationId || null,
      transitionType: data.transitionType || 'fade',
      transitionDurationMs: data.transitionDurationMs ?? 500,
      defaultDurationSec: data.defaultDurationSec ?? 5,
      createdById,
    },
    include: playlistInclude,
  });
}

export async function update(id: string, data: UpdatePlaylistInput) {
  const existing = await prisma.playlist.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Playlist not found');

  if (data.locationId) {
    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) throw AppError.notFound('Location not found');
  }

  return prisma.playlist.update({
    where: { id },
    data,
    include: playlistInclude,
  });
}

export async function remove(id: string) {
  const existing = await prisma.playlist.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Playlist not found');

  await prisma.playlist.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
}

export async function addItem(playlistId: string, data: AddPlaylistItemInput) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist) throw AppError.notFound('Playlist not found');

  if (data.productId) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw AppError.notFound('Product not found');
  }
  if (data.offerId) {
    const offer = await prisma.offer.findUnique({ where: { id: data.offerId } });
    if (!offer) throw AppError.notFound('Offer not found');
  }

  return prisma.playlistItem.create({
    data: {
      playlistId,
      itemType: data.itemType,
      productId: data.productId || null,
      offerId: data.offerId || null,
      mediaUrl: data.mediaUrl || null,
      customText: data.customText || null,
      customStyle: data.customStyle as any || null,
      displayDurationSeconds: data.displayDurationSeconds,
      displayOrder: data.displayOrder,
    },
    include: itemInclude,
  });
}

export async function updateItem(playlistId: string, itemId: string, data: UpdatePlaylistItemInput) {
  const item = await prisma.playlistItem.findFirst({
    where: { id: itemId, playlistId },
  });
  if (!item) throw AppError.notFound('Playlist item not found');

  return prisma.playlistItem.update({
    where: { id: itemId },
    data: {
      ...(data.customText !== undefined && { customText: data.customText }),
      ...(data.customStyle !== undefined && { customStyle: data.customStyle as any }),
      ...(data.displayDurationSeconds !== undefined && { displayDurationSeconds: data.displayDurationSeconds }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: itemInclude,
  });
}

export async function removeItem(playlistId: string, itemId: string) {
  const item = await prisma.playlistItem.findFirst({
    where: { id: itemId, playlistId },
  });
  if (!item) throw AppError.notFound('Playlist item not found');

  await prisma.playlistItem.delete({ where: { id: itemId } });
}

export async function reorderItems(playlistId: string, data: ReorderItemsInput) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist) throw AppError.notFound('Playlist not found');

  await prisma.$transaction(
    data.items.map((item) =>
      prisma.playlistItem.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    )
  );

  return prisma.playlistItem.findMany({
    where: { playlistId, isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: itemInclude,
  });
}

export async function publish(id: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: { items: { where: { isActive: true } } },
  });
  if (!playlist) throw AppError.notFound('Playlist not found');

  if (playlist.items.length === 0) {
    throw AppError.badRequest('Cannot publish an empty playlist');
  }

  const updated = await prisma.playlist.update({
    where: { id },
    data: {
      status: 'published',
      version: playlist.version + 1,
      publishedAt: new Date(),
    },
    include: playlistInclude,
  });

  // Find all screens that have active schedules with this playlist
  const schedules = await prisma.schedule.findMany({
    where: { playlistId: id, isActive: true },
    select: { screenId: true },
  });
  const affectedScreenIds = [...new Set(schedules.map((s) => s.screenId))];

  createSystemLog('info', 'playlists', 'publish', `Playlist "${updated.name}" published (v${updated.version}), affecting ${affectedScreenIds.length} screen(s)`);

  return { playlist: updated, affectedScreenIds };
}

export async function duplicate(id: string, createdById: string) {
  const original = await prisma.playlist.findUnique({
    where: { id },
    include: { items: { orderBy: { displayOrder: 'asc' } } },
  });
  if (!original) throw AppError.notFound('Playlist not found');

  const copy = await prisma.playlist.create({
    data: {
      name: `${original.name} (Copy)`,
      description: original.description,
      locationId: original.locationId,
      transitionType: original.transitionType,
      transitionDurationMs: original.transitionDurationMs,
      defaultDurationSec: original.defaultDurationSec,
      createdById,
      status: 'draft',
      version: 1,
    },
    include: playlistInclude,
  });

  if (original.items.length > 0) {
    await prisma.playlistItem.createMany({
      data: original.items.map((item) => ({
        playlistId: copy.id,
        itemType: item.itemType,
        productId: item.productId,
        offerId: item.offerId,
        mediaUrl: item.mediaUrl,
        customText: item.customText,
        customStyle: item.customStyle as any,
        displayDurationSeconds: item.displayDurationSeconds,
        displayOrder: item.displayOrder,
        isActive: item.isActive,
      })),
    });
  }

  return getById(copy.id);
}

// Hydrated playlist for screen devices (full product images + prices for location)
export async function getPlaylistForScreen(playlistId: string, locationId: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          product: {
            include: {
              prices: { where: { locationId } },
              category: { select: { id: true, name: true } },
            },
          },
          offer: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true },
              },
            },
          },
        },
      },
    },
  });

  if (!playlist) throw AppError.notFound('Playlist not found');
  return playlist;
}
