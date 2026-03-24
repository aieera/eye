export const USER_ROLES = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
} as const;

export const SCREEN_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error',
} as const;

export const PLAYLIST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export const OFFER_SOURCE = {
  MANUAL: 'manual',
  ORACLE: 'oracle',
} as const;

export const SYNC_TYPE = {
  FULL: 'full',
  INCREMENTAL: 'incremental',
} as const;

export const SYNC_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;
