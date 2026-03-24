export interface IngestionConnection {
  id: string;
  name: string;
  connectionType: string;
  isActive: boolean;
  lastSyncAt?: string | null;
  syncIntervalMinutes: number;
  lastTestedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { fieldMappings: number; ingestionLogs: number };
  ingestionLogs?: IngestionLog[];
  fieldMappings?: IngestionFieldMapping[];
}

export interface IngestionFieldMapping {
  id: string;
  connectionId: string;
  entityType: "product" | "price";
  externalField: string;
  internalField: string;
  transformRule?: string | null;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IngestionLog {
  id: string;
  connectionId: string;
  syncType: "full" | "incremental" | "price-only";
  status: "running" | "success" | "failed";
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorMessage?: string | null;
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
}

export interface CreateConnectionPayload {
  name: string;
  host: string;
  port: number;
  serviceName: string;
  username: string;
  password: string;
  syncIntervalMinutes?: number;
}

export interface TestConnectionPayload {
  host: string;
  port: number;
  serviceName: string;
  username: string;
  password: string;
}

export interface SyncStatus {
  status: "running" | "idle";
  currentLog?: IngestionLog | null;
}

export interface FieldMappingResponse {
  product: IngestionFieldMapping[] | DefaultMapping[];
  price: IngestionFieldMapping[] | DefaultMapping[];
  isDefault: boolean;
}

export interface DefaultMapping {
  externalField: string;
  internalField: string;
  transformRule: string | null;
  isRequired: boolean;
}
