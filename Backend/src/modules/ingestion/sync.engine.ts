import prisma from '../../config/database';
import { logger } from '../../shared/utils/logger';
import { decrypt } from '../../shared/utils/encryption';
import { emitToAdmins } from '../websocket/socket';
import { WS_EVENTS } from '../websocket/events';
import {
  createOracleConnection, fetchOracleItems, fetchOracleItemLocPrices,
  fetchOraclePriceChanges, closeOracleConnection, type OracleConfig,
} from './oracle.connector';
import {
  getDefaultProductMappings, getDefaultPriceMappings,
  mapRecords, type FieldMapping,
} from './field.mapper';
import { Prisma } from '@prisma/client';

const BATCH_SIZE = 200;

// Caches
let locationCache: Map<string, string> | null = null; // oracleLocationId -> our UUID
let productCache: Map<string, string> | null = null; // externalItemCode -> our UUID

async function buildLocationCache(): Promise<Map<string, string>> {
  if (locationCache) return locationCache;
  const locations = await prisma.location.findMany({
    where: { oracleLocationId: { not: null } },
    select: { id: true, oracleLocationId: true },
  });
  locationCache = new Map();
  for (const loc of locations) {
    if (loc.oracleLocationId) locationCache.set(loc.oracleLocationId, loc.id);
  }
  return locationCache;
}

async function buildProductCache(): Promise<Map<string, string>> {
  if (productCache) return productCache;
  const products = await prisma.product.findMany({
    select: { id: true, externalItemCode: true },
  });
  productCache = new Map();
  for (const p of products) {
    productCache.set(p.externalItemCode, p.id);
  }
  return productCache;
}

function clearCaches() {
  locationCache = null;
  productCache = null;
}

async function getConnectionConfig(connectionId: string): Promise<{ connection: any; config: OracleConfig }> {
  const conn = await prisma.ingestionConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw new Error(`Connection ${connectionId} not found`);
  if (!conn.isActive) throw new Error(`Connection ${connectionId} is inactive`);

  const decrypted = JSON.parse(decrypt(conn.encryptedConnectionConfig)) as OracleConfig;
  return { connection: conn, config: decrypted };
}

async function loadMappings(connectionId: string): Promise<{ productMappings: FieldMapping[]; priceMappings: FieldMapping[] }> {
  const saved = await prisma.ingestionFieldMapping.findMany({ where: { connectionId } });
  const productMappings = saved.filter((m) => m.entityType === 'product').map((m) => ({
    externalField: m.externalField,
    internalField: m.internalField,
    transformRule: m.transformRule,
    isRequired: m.isRequired,
  }));
  const priceMappings = saved.filter((m) => m.entityType === 'price').map((m) => ({
    externalField: m.externalField,
    internalField: m.internalField,
    transformRule: m.transformRule,
    isRequired: m.isRequired,
  }));

  return {
    productMappings: productMappings.length > 0 ? productMappings : getDefaultProductMappings(),
    priceMappings: priceMappings.length > 0 ? priceMappings : getDefaultPriceMappings(),
  };
}

async function ensureCategories(records: Record<string, any>[]): Promise<void> {
  const combos = new Set<string>();
  for (const r of records) {
    const dept = r.dept;
    if (dept) combos.add(dept);
  }

  for (const dept of combos) {
    try {
      const existing = await prisma.category.findFirst({
        where: { oracleDept: dept, level: 'dept' },
      });
      if (!existing) {
        await prisma.category.create({
          data: { name: `Dept ${dept}`, oracleDept: dept, level: 'dept' },
        });
      }
    } catch { /* ignore duplicate */ }
  }
}

async function upsertProducts(
  mappedRecords: Record<string, any>[],
  logId: string,
): Promise<{ created: number; updated: number; failed: number }> {
  let created = 0, updated = 0, failed = 0;
  const pCache = await buildProductCache();

  for (let i = 0; i < mappedRecords.length; i += BATCH_SIZE) {
    const batch = mappedRecords.slice(i, i + BATCH_SIZE);

    for (const record of batch) {
      try {
        const itemCode = record.externalItemCode;
        if (!itemCode) { failed++; continue; }

        // Look up category
        let categoryId: string | null = null;
        if (record.dept) {
          const cat = await prisma.category.findFirst({
            where: { oracleDept: record.dept, level: 'dept' },
          });
          if (cat) categoryId = cat.id;
        }

        const existing = await prisma.product.findUnique({ where: { externalItemCode: itemCode } });

        if (existing) {
          await prisma.product.update({
            where: { externalItemCode: itemCode },
            data: {
              name: record.name || existing.name,
              shortName: record.shortName || existing.shortName,
              dept: record.dept,
              classCode: record.classCode,
              subclass: record.subclass,
              status: record.status || existing.status,
              uom: record.uom || existing.uom,
              categoryId: categoryId || existing.categoryId,
              isSynced: true,
              oracleSyncedAt: new Date(),
            },
          });
          pCache.set(itemCode, existing.id);
          updated++;
        } else {
          const newProduct = await prisma.product.create({
            data: {
              externalItemCode: itemCode,
              name: record.name || itemCode,
              shortName: record.shortName,
              dept: record.dept,
              classCode: record.classCode,
              subclass: record.subclass,
              status: record.status || 'active',
              uom: record.uom,
              categoryId,
              isSynced: true,
              oracleSyncedAt: new Date(),
            },
          });
          pCache.set(itemCode, newProduct.id);
          created++;
        }
      } catch (err: any) {
        failed++;
        logger.warn(`Product upsert failed: ${err.message}`);
      }
    }
  }

  return { created, updated, failed };
}

async function upsertPrices(mappedRecords: Record<string, any>[]): Promise<{ updated: number; failed: number }> {
  let updated = 0, failed = 0;
  const locCache = await buildLocationCache();
  const pCache = await buildProductCache();

  for (let i = 0; i < mappedRecords.length; i += BATCH_SIZE) {
    const batch = mappedRecords.slice(i, i + BATCH_SIZE);

    for (const record of batch) {
      try {
        const itemCode = record.externalItemCode;
        const oracleLocId = record.locationId;
        if (!itemCode || !oracleLocId) { failed++; continue; }

        const productId = pCache.get(itemCode);
        const locationId = locCache.get(oracleLocId);
        if (!productId || !locationId) { failed++; continue; }

        await prisma.productPrice.upsert({
          where: { productId_locationId: { productId, locationId } },
          create: {
            productId,
            locationId,
            unitRetail: new Prisma.Decimal(record.unitRetail || 0),
            sellingUnitRetail: record.sellingUnitRetail ? new Prisma.Decimal(record.sellingUnitRetail) : null,
            sellingUom: record.sellingUom || null,
            currency: 'AED',
          },
          update: {
            unitRetail: new Prisma.Decimal(record.unitRetail || 0),
            sellingUnitRetail: record.sellingUnitRetail ? new Prisma.Decimal(record.sellingUnitRetail) : null,
            sellingUom: record.sellingUom || null,
          },
        });
        updated++;
      } catch (err: any) {
        failed++;
        logger.warn(`Price upsert failed: ${err.message}`);
      }
    }
  }

  return { updated, failed };
}

export async function fullSync(connectionId: string, triggeredBy: string): Promise<void> {
  clearCaches();
  let oracleConn: any = null;
  const logEntry = await prisma.ingestionLog.create({
    data: {
      connectionId,
      syncType: 'full',
      status: 'running',
      startedAt: new Date(),
    },
  });

  emitToAdmins(WS_EVENTS.SYNC_STARTED, {
    connectionId, syncType: 'full', logId: logEntry.id, triggeredBy,
    timestamp: new Date().toISOString(),
  });

  try {
    const { config: oracleConfig } = await getConnectionConfig(connectionId);
    const { productMappings, priceMappings } = await loadMappings(connectionId);

    oracleConn = await createOracleConnection(oracleConfig);

    // Fetch items
    const rawItems = await fetchOracleItems(oracleConn);
    logger.info(`Full sync: fetched ${rawItems.length} items from Oracle`);

    const { results: mappedItems, totalErrors, errorSamples } = mapRecords(rawItems, productMappings);

    // Ensure categories
    await ensureCategories(mappedItems);

    // Upsert products
    const productResult = await upsertProducts(mappedItems, logEntry.id);

    // Fetch prices
    const locCache = await buildLocationCache();
    const oracleLocIds = Array.from(locCache.keys());
    let priceResult = { updated: 0, failed: 0 };

    if (oracleLocIds.length > 0) {
      const rawPrices = await fetchOracleItemLocPrices(oracleConn, oracleLocIds);
      logger.info(`Full sync: fetched ${rawPrices.length} prices from Oracle`);
      const { results: mappedPrices } = mapRecords(rawPrices, priceMappings);
      priceResult = await upsertPrices(mappedPrices);
    }

    const totalProcessed = rawItems.length;
    const totalCreated = productResult.created;
    const totalUpdated = productResult.updated + priceResult.updated;
    const totalFailed = productResult.failed + priceResult.failed;

    await prisma.ingestionLog.update({
      where: { id: logEntry.id },
      data: {
        status: 'success',
        recordsProcessed: totalProcessed,
        recordsCreated: totalCreated,
        recordsUpdated: totalUpdated,
        recordsFailed: totalFailed,
        errorMessage: errorSamples.length > 0 ? errorSamples.join('\n') : null,
        completedAt: new Date(),
      },
    });

    await prisma.ingestionConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });

    emitToAdmins(WS_EVENTS.SYNC_COMPLETED, {
      connectionId, syncType: 'full', logId: logEntry.id,
      processed: totalProcessed, created: totalCreated, updated: totalUpdated, failed: totalFailed,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Full sync completed: ${totalCreated} created, ${totalUpdated} updated, ${totalFailed} failed`);
  } catch (err: any) {
    logger.error(`Full sync failed: ${err.message}`);
    await prisma.ingestionLog.update({
      where: { id: logEntry.id },
      data: { status: 'failed', errorMessage: err.message, completedAt: new Date() },
    });
    emitToAdmins(WS_EVENTS.SYNC_FAILED, {
      connectionId, syncType: 'full', logId: logEntry.id, error: err.message,
      timestamp: new Date().toISOString(),
    });
    throw err;
  } finally {
    await closeOracleConnection(oracleConn);
    clearCaches();
  }
}

export async function incrementalSync(connectionId: string, triggeredBy: string): Promise<void> {
  const conn = await prisma.ingestionConnection.findUnique({ where: { id: connectionId } });
  if (!conn?.lastSyncAt) {
    logger.info('No previous sync — falling back to full sync');
    return fullSync(connectionId, triggeredBy);
  }

  clearCaches();
  let oracleConn: any = null;
  const logEntry = await prisma.ingestionLog.create({
    data: { connectionId, syncType: 'incremental', status: 'running', startedAt: new Date() },
  });

  emitToAdmins(WS_EVENTS.SYNC_STARTED, {
    connectionId, syncType: 'incremental', logId: logEntry.id, triggeredBy,
    timestamp: new Date().toISOString(),
  });

  try {
    const { config: oracleConfig } = await getConnectionConfig(connectionId);
    const { productMappings, priceMappings } = await loadMappings(connectionId);

    oracleConn = await createOracleConnection(oracleConfig);

    const rawItems = await fetchOracleItems(oracleConn, conn.lastSyncAt);
    logger.info(`Incremental sync: fetched ${rawItems.length} changed items`);

    const { results: mappedItems, errorSamples } = mapRecords(rawItems, productMappings);
    await ensureCategories(mappedItems);
    const productResult = await upsertProducts(mappedItems, logEntry.id);

    const locCache = await buildLocationCache();
    const oracleLocIds = Array.from(locCache.keys());
    let priceResult = { updated: 0, failed: 0 };

    if (oracleLocIds.length > 0) {
      const rawPrices = await fetchOracleItemLocPrices(oracleConn, oracleLocIds, conn.lastSyncAt);
      const { results: mappedPrices } = mapRecords(rawPrices, priceMappings);
      priceResult = await upsertPrices(mappedPrices);
    }

    await prisma.ingestionLog.update({
      where: { id: logEntry.id },
      data: {
        status: 'success',
        recordsProcessed: rawItems.length,
        recordsCreated: productResult.created,
        recordsUpdated: productResult.updated + priceResult.updated,
        recordsFailed: productResult.failed + priceResult.failed,
        errorMessage: errorSamples.length > 0 ? errorSamples.join('\n') : null,
        completedAt: new Date(),
      },
    });

    await prisma.ingestionConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });

    emitToAdmins(WS_EVENTS.SYNC_COMPLETED, {
      connectionId, syncType: 'incremental', logId: logEntry.id,
      processed: rawItems.length, created: productResult.created,
      updated: productResult.updated + priceResult.updated,
      failed: productResult.failed + priceResult.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error(`Incremental sync failed: ${err.message}`);
    await prisma.ingestionLog.update({
      where: { id: logEntry.id },
      data: { status: 'failed', errorMessage: err.message, completedAt: new Date() },
    });
    emitToAdmins(WS_EVENTS.SYNC_FAILED, {
      connectionId, syncType: 'incremental', logId: logEntry.id, error: err.message,
      timestamp: new Date().toISOString(),
    });
    throw err;
  } finally {
    await closeOracleConnection(oracleConn);
    clearCaches();
  }
}

export async function priceSyncOnly(connectionId: string, triggeredBy: string): Promise<void> {
  clearCaches();
  let oracleConn: any = null;
  const conn = await prisma.ingestionConnection.findUnique({ where: { id: connectionId } });
  const logEntry = await prisma.ingestionLog.create({
    data: { connectionId, syncType: 'price-only', status: 'running', startedAt: new Date() },
  });

  emitToAdmins(WS_EVENTS.SYNC_STARTED, {
    connectionId, syncType: 'price-only', logId: logEntry.id, triggeredBy,
    timestamp: new Date().toISOString(),
  });

  try {
    const { config: oracleConfig } = await getConnectionConfig(connectionId);
    const { priceMappings } = await loadMappings(connectionId);

    oracleConn = await createOracleConnection(oracleConfig);
    const locCache = await buildLocationCache();
    const oracleLocIds = Array.from(locCache.keys());

    let totalProcessed = 0;
    let priceResult = { updated: 0, failed: 0 };

    // Try RPM_REG_PRICE_CHANGE first
    const fromDate = conn?.lastSyncAt || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const priceChanges = await fetchOraclePriceChanges(oracleConn, fromDate);

    if (priceChanges.length > 0) {
      totalProcessed = priceChanges.length;
      // Map price changes — different structure
      for (const change of priceChanges) {
        try {
          const oracleLocId = String(change.LOCATION_ID);
          const itemCode = String(change.ITEM_CODE).trim();
          const locationId = locCache.get(oracleLocId);
          const pCache = await buildProductCache();
          const productId = pCache.get(itemCode);

          if (productId && locationId) {
            await prisma.productPrice.upsert({
              where: { productId_locationId: { productId, locationId } },
              create: { productId, locationId, unitRetail: new Prisma.Decimal(change.NEW_RETAIL || 0), currency: 'AED' },
              update: { unitRetail: new Prisma.Decimal(change.NEW_RETAIL || 0) },
            });
            priceResult.updated++;
          } else {
            priceResult.failed++;
          }
        } catch { priceResult.failed++; }
      }
    } else if (oracleLocIds.length > 0) {
      // Fallback: ITEM_LOC
      const rawPrices = await fetchOracleItemLocPrices(oracleConn, oracleLocIds, conn?.lastSyncAt || undefined);
      totalProcessed = rawPrices.length;
      const { results: mappedPrices } = mapRecords(rawPrices, priceMappings);
      priceResult = await upsertPrices(mappedPrices);
    }

    await prisma.ingestionLog.update({
      where: { id: logEntry.id },
      data: {
        status: 'success',
        recordsProcessed: totalProcessed,
        recordsUpdated: priceResult.updated,
        recordsFailed: priceResult.failed,
        completedAt: new Date(),
      },
    });

    await prisma.ingestionConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });

    emitToAdmins(WS_EVENTS.SYNC_COMPLETED, {
      connectionId, syncType: 'price-only', logId: logEntry.id,
      processed: totalProcessed, updated: priceResult.updated, failed: priceResult.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error(`Price sync failed: ${err.message}`);
    await prisma.ingestionLog.update({
      where: { id: logEntry.id },
      data: { status: 'failed', errorMessage: err.message, completedAt: new Date() },
    });
    emitToAdmins(WS_EVENTS.SYNC_FAILED, {
      connectionId, syncType: 'price-only', logId: logEntry.id, error: err.message,
      timestamp: new Date().toISOString(),
    });
    throw err;
  } finally {
    await closeOracleConnection(oracleConn);
    clearCaches();
  }
}
