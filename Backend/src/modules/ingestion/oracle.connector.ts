import { logger } from '../../shared/utils/logger';

// Lazy-loaded oracledb — never crash if unavailable
let oracledb: any = null;

async function getOracleDb(): Promise<any> {
  if (oracledb) return oracledb;
  try {
    oracledb = await import('oracledb');
    if (oracledb.default) oracledb = oracledb.default;
    // Set thick mode if available (ignore errors)
    try { oracledb.initOracleClient?.(); } catch { /* thin mode */ }
    return oracledb;
  } catch (err: any) {
    logger.error(`Oracle driver not available: ${err.message}`);
    throw new Error('Oracle database driver (oracledb) is not available. Install it or check native dependencies.');
  }
}

export interface OracleConfig {
  host: string;
  port: number;
  serviceName: string;
  username: string;
  password: string;
}

export async function testOracleConnection(config: OracleConfig): Promise<{ success: boolean; serverInfo?: string; error?: string }> {
  let connection: any = null;
  try {
    const db = await getOracleDb();
    const connectString = `${config.host}:${config.port}/${config.serviceName}`;
    connection = await db.getConnection({
      user: config.username,
      password: config.password,
      connectString,
    });

    const result = await connection.execute('SELECT banner FROM v$version WHERE ROWNUM = 1');
    const serverInfo = result.rows?.[0]?.[0] || 'Connected';
    await connection.close();
    return { success: true, serverInfo };
  } catch (err: any) {
    if (connection) try { await connection.close(); } catch { /* ignore */ }
    return { success: false, error: err.message };
  }
}

export async function createOracleConnection(config: OracleConfig): Promise<any> {
  const db = await getOracleDb();
  const connectString = `${config.host}:${config.port}/${config.serviceName}`;
  return db.getConnection({
    user: config.username,
    password: config.password,
    connectString,
  });
}

export async function fetchOracleItems(connection: any, lastSyncAt?: Date): Promise<any[]> {
  const db = await getOracleDb();
  let sql = `SELECT ITEM_CODE, ITEM_LONG_DESC, ITEM_SHORT_DESC, DEPT, CLASS, SUBCLASS, STATUS, SELLABLE_IND, STANDARD_UOM, CHANGED_ON
    FROM ITEMS WHERE STATUS = 'A' AND SELLABLE_IND = 'Y'`;
  const binds: any = {};

  if (lastSyncAt) {
    sql += ` AND CHANGED_ON > :lastSync`;
    binds.lastSync = lastSyncAt;
  }

  const result = await connection.execute(sql, binds, {
    outFormat: db.OUT_FORMAT_OBJECT,
    fetchArraySize: 500,
  });

  return result.rows || [];
}

export async function fetchOracleItemLocPrices(connection: any, locationIds: string[], lastSyncAt?: Date): Promise<any[]> {
  const db = await getOracleDb();
  // Build IN clause with bind variables
  const bindNames = locationIds.map((_, i) => `:loc${i}`);
  let sql = `SELECT ITEM_CODE, LOCATION_ID, UNIT_RETAIL, SELLING_UNIT_RETAIL, SELLING_UOM, CHANGED_ON
    FROM ITEM_LOC WHERE LOCATION_ID IN (${bindNames.join(',')})`;

  const binds: any = {};
  locationIds.forEach((id, i) => { binds[`loc${i}`] = id; });

  if (lastSyncAt) {
    sql += ` AND CHANGED_ON > :lastSync`;
    binds.lastSync = lastSyncAt;
  }

  const result = await connection.execute(sql, binds, {
    outFormat: db.OUT_FORMAT_OBJECT,
    fetchArraySize: 500,
  });

  return result.rows || [];
}

export async function fetchOraclePriceChanges(connection: any, fromDate: Date): Promise<any[]> {
  const db = await getOracleDb();
  try {
    const sql = `SELECT LOCATION_ID, ITEM_CODE, NEW_RETAIL, EFFECTIVE_DATE
      FROM RPM_REG_PRICE_CHANGE WHERE EFFECTIVE_DATE >= :fromDate`;
    const result = await connection.execute(sql, { fromDate }, {
      outFormat: db.OUT_FORMAT_OBJECT,
      fetchArraySize: 500,
    });
    return result.rows || [];
  } catch (err: any) {
    logger.warn(`Price changes query failed (table may not exist): ${err.message}`);
    return [];
  }
}

export async function closeOracleConnection(connection: any): Promise<void> {
  if (connection) {
    try { await connection.close(); } catch { /* ignore */ }
  }
}
