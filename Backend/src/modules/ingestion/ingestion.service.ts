import prisma from '../../config/database';
import { AppError } from '../../shared/utils/apiError';
import { encrypt, decrypt } from '../../shared/utils/encryption';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import { testOracleConnection, type OracleConfig } from './oracle.connector';
import { getDefaultProductMappings, getDefaultPriceMappings } from './field.mapper';
import { addIngestionJob } from '../../jobs/queue';
import type {
  CreateConnectionInput, UpdateConnectionInput, TestConnectionInput,
  TriggerSyncInput, CreateFieldMappingInput, UpdateFieldMappingInput, ListLogsQuery,
} from './ingestion.schema';

export async function listConnections() {
  const connections = await prisma.ingestionConnection.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { fieldMappings: true, ingestionLogs: true } },
      ingestionLogs: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, syncType: true, status: true, recordsProcessed: true, recordsCreated: true, recordsUpdated: true, recordsFailed: true, startedAt: true, completedAt: true },
      },
    },
  });

  // Strip encrypted config
  return connections.map(({ encryptedConnectionConfig, ...rest }) => rest);
}

export async function getConnection(id: string) {
  const conn = await prisma.ingestionConnection.findUnique({
    where: { id },
    include: {
      fieldMappings: { orderBy: { entityType: 'asc' } },
      ingestionLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!conn) throw AppError.notFound('Connection not found');

  const { encryptedConnectionConfig, ...safe } = conn;
  return safe;
}

export async function createConnection(data: CreateConnectionInput) {
  const oracleConfig: OracleConfig = {
    host: data.host,
    port: data.port,
    serviceName: data.serviceName,
    username: data.username,
    password: data.password,
  };

  const encrypted = encrypt(JSON.stringify(oracleConfig));

  const connection = await prisma.ingestionConnection.create({
    data: {
      name: data.name,
      connectionType: 'oracle',
      encryptedConnectionConfig: encrypted,
      syncIntervalMinutes: data.syncIntervalMinutes,
    },
  });

  const { encryptedConnectionConfig, ...safe } = connection;
  return safe;
}

export async function updateConnection(id: string, data: UpdateConnectionInput) {
  const existing = await prisma.ingestionConnection.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Connection not found');

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.syncIntervalMinutes !== undefined) updateData.syncIntervalMinutes = data.syncIntervalMinutes;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Re-encrypt if connection details changed
  if (data.host || data.port || data.serviceName || data.username || data.password) {
    const currentConfig = JSON.parse(decrypt(existing.encryptedConnectionConfig)) as OracleConfig;
    const newConfig: OracleConfig = {
      host: data.host || currentConfig.host,
      port: data.port || currentConfig.port,
      serviceName: data.serviceName || currentConfig.serviceName,
      username: data.username || currentConfig.username,
      password: data.password || currentConfig.password,
    };
    updateData.encryptedConnectionConfig = encrypt(JSON.stringify(newConfig));
  }

  const updated = await prisma.ingestionConnection.update({
    where: { id },
    data: updateData,
  });

  const { encryptedConnectionConfig, ...safe } = updated;
  return safe;
}

export async function deleteConnection(id: string) {
  const existing = await prisma.ingestionConnection.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Connection not found');

  await prisma.ingestionConnection.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function testConnection(data: TestConnectionInput) {
  const config: OracleConfig = {
    host: data.host,
    port: data.port,
    serviceName: data.serviceName,
    username: data.username,
    password: data.password,
  };

  return testOracleConnection(config);
}

export async function testSavedConnection(id: string) {
  const conn = await prisma.ingestionConnection.findUnique({ where: { id } });
  if (!conn) throw AppError.notFound('Connection not found');

  const config = JSON.parse(decrypt(conn.encryptedConnectionConfig)) as OracleConfig;
  const result = await testOracleConnection(config);

  await prisma.ingestionConnection.update({
    where: { id },
    data: { lastTestedAt: new Date() },
  });

  return result;
}

export async function getFieldMappings(connectionId: string) {
  const conn = await prisma.ingestionConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw AppError.notFound('Connection not found');

  const saved = await prisma.ingestionFieldMapping.findMany({
    where: { connectionId },
    orderBy: [{ entityType: 'asc' }, { createdAt: 'asc' }],
  });

  if (saved.length === 0) {
    // Return defaults
    return {
      product: getDefaultProductMappings(),
      price: getDefaultPriceMappings(),
      isDefault: true,
    };
  }

  return {
    product: saved.filter((m) => m.entityType === 'product'),
    price: saved.filter((m) => m.entityType === 'price'),
    isDefault: false,
  };
}

export async function createFieldMapping(connectionId: string, data: CreateFieldMappingInput) {
  const conn = await prisma.ingestionConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw AppError.notFound('Connection not found');

  return prisma.ingestionFieldMapping.create({
    data: {
      connectionId,
      entityType: data.entityType,
      externalField: data.externalField,
      internalField: data.internalField,
      transformRule: data.transformRule || null,
      isRequired: data.isRequired,
    },
  });
}

export async function updateFieldMapping(mappingId: string, data: UpdateFieldMappingInput) {
  const mapping = await prisma.ingestionFieldMapping.findUnique({ where: { id: mappingId } });
  if (!mapping) throw AppError.notFound('Field mapping not found');

  return prisma.ingestionFieldMapping.update({
    where: { id: mappingId },
    data,
  });
}

export async function deleteFieldMapping(mappingId: string) {
  const mapping = await prisma.ingestionFieldMapping.findUnique({ where: { id: mappingId } });
  if (!mapping) throw AppError.notFound('Field mapping not found');

  await prisma.ingestionFieldMapping.delete({ where: { id: mappingId } });
}

export async function triggerSync(connectionId: string, data: TriggerSyncInput, triggeredBy: string) {
  const conn = await prisma.ingestionConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw AppError.notFound('Connection not found');
  if (!conn.isActive) throw AppError.badRequest('Connection is inactive');

  // Check no running sync
  const running = await prisma.ingestionLog.findFirst({
    where: { connectionId, status: 'running' },
  });
  if (running) throw AppError.conflict('A sync is already running for this connection');

  const queued = await addIngestionJob({
    connectionId,
    syncType: data.syncType,
    triggeredBy,
  });

  if (!queued) {
    throw AppError.internal('Redis unavailable — cannot queue sync job. Try again later.');
  }

  return { queued: true, syncType: data.syncType };
}

export async function getSyncLogs(connectionId: string, query: ListLogsQuery) {
  const { page, limit, skip } = parsePagination(query);
  const where: any = { connectionId };
  if (query.status) where.status = query.status;
  if (query.syncType) where.syncType = query.syncType;

  const [logs, total] = await Promise.all([
    prisma.ingestionLog.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ingestionLog.count({ where }),
  ]);

  return { logs, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getSyncStatus(connectionId: string) {
  const running = await prisma.ingestionLog.findFirst({
    where: { connectionId, status: 'running' },
    orderBy: { startedAt: 'desc' },
  });

  return { status: running ? 'running' : 'idle', currentLog: running };
}
