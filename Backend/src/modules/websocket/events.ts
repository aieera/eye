export const WS_EVENTS = {
  // Screen events
  SCREEN_CONNECTED: 'screen:connected',
  SCREEN_DISCONNECTED: 'screen:disconnected',
  SCREEN_HEARTBEAT: 'screen:heartbeat',
  SCREEN_STATUS_CHANGED: 'screen:status_changed',

  // Playlist events
  PLAYLIST_PUBLISHED: 'playlist:published',
  PLAYLIST_UPDATED: 'playlist:updated',

  // Schedule events
  SCHEDULE_UPDATED: 'schedule:updated',
  SCHEDULE_CREATED: 'schedule:created',
  SCHEDULE_DELETED: 'schedule:deleted',

  // Sync events (for Phase 4)
  SYNC_STARTED: 'sync:started',
  SYNC_PROGRESS: 'sync:progress',
  SYNC_COMPLETED: 'sync:completed',
  SYNC_FAILED: 'sync:failed',

  // Admin notifications
  ADMIN_NOTIFICATION: 'admin:notification',
} as const;
