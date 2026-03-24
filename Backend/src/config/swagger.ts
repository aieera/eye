import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Digital Signage Platform API',
      version: '1.0.0',
      description: 'API for managing digital signage screens, playlists, schedules, and Oracle data ingestion',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        DeviceToken: { type: 'apiKey', in: 'header', name: 'X-Device-Token' },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Dashboard', description: 'Dashboard statistics' },
      { name: 'Screens', description: 'Screen management' },
      { name: 'Products', description: 'Product catalog' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Offers', description: 'Promotional offers' },
      { name: 'Playlists', description: 'Content playlists' },
      { name: 'Schedules', description: 'Screen schedules' },
      { name: 'Locations', description: 'Store locations' },
      { name: 'Ingestion', description: 'Oracle data ingestion' },
      { name: 'Media', description: 'Media management' },
      { name: 'Logs', description: 'System & screen logs' },
      { name: 'Device', description: 'Screen device API' },
    ],
    paths: {
      '/auth/login': {
        post: {
          summary: 'Admin login',
          tags: ['Auth'],
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 } } } } } },
          responses: { '200': { description: 'Login successful with JWT token' }, '401': { description: 'Invalid credentials' } },
        },
      },
      '/auth/me': { get: { summary: 'Get current user', tags: ['Auth'], responses: { '200': { description: 'Current user profile' } } } },
      '/auth/refresh': { post: { summary: 'Refresh access token', tags: ['Auth'], security: [], responses: { '200': { description: 'New access token' } } } },
      '/auth/logout': { post: { summary: 'Logout', tags: ['Auth'], responses: { '200': { description: 'Logged out' } } } },
      '/auth/change-password': { post: { summary: 'Change password', tags: ['Auth'], responses: { '200': { description: 'Password changed' } } } },
      '/dashboard/stats': { get: { summary: 'Get dashboard statistics', tags: ['Dashboard'], responses: { '200': { description: 'Dashboard stats' } } } },
      '/dashboard/activity': { get: { summary: 'Get recent activity', tags: ['Dashboard'], responses: { '200': { description: 'Recent activity list' } } } },
      '/screens': {
        get: { summary: 'List screens', tags: ['Screens'], parameters: [{ name: 'page', in: 'query', schema: { type: 'number' } }, { name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'status', in: 'query', schema: { type: 'string', enum: ['online', 'offline', 'error'] } }], responses: { '200': { description: 'Paginated screen list' } } },
        post: { summary: 'Create screen', tags: ['Screens'], responses: { '201': { description: 'Screen created with device secret' } } },
      },
      '/screens/stats': { get: { summary: 'Get screen statistics', tags: ['Screens'], responses: { '200': { description: 'Screen counts by status' } } } },
      '/screens/{id}': {
        get: { summary: 'Get screen by ID', tags: ['Screens'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Screen details' } } },
        put: { summary: 'Update screen', tags: ['Screens'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Screen updated' } } },
        delete: { summary: 'Delete screen (soft)', tags: ['Screens'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '204': { description: 'Screen deleted' } } },
      },
      '/products': { get: { summary: 'List products', tags: ['Products'], responses: { '200': { description: 'Paginated product list' } } }, post: { summary: 'Create product', tags: ['Products'], responses: { '201': { description: 'Product created' } } } },
      '/products/bulk': { post: { summary: 'Bulk upsert products', tags: ['Products'], responses: { '200': { description: 'Bulk operation results' } } } },
      '/products/{id}': { get: { summary: 'Get product', tags: ['Products'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Product details with prices' } } }, put: { summary: 'Update product', tags: ['Products'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Product updated' } } }, delete: { summary: 'Delete product', tags: ['Products'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'Product deleted' } } } },
      '/products/{id}/prices': { get: { summary: 'Get product prices', tags: ['Products'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Prices by location' } } }, put: { summary: 'Update product prices', tags: ['Products'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Prices updated' } } } },
      '/categories': { get: { summary: 'List categories', tags: ['Categories'], responses: { '200': { description: 'Paginated categories' } } }, post: { summary: 'Create category', tags: ['Categories'], responses: { '201': { description: 'Category created' } } } },
      '/categories/tree': { get: { summary: 'Get category tree', tags: ['Categories'], responses: { '200': { description: 'Full category hierarchy' } } } },
      '/offers': { get: { summary: 'List offers', tags: ['Offers'], responses: { '200': { description: 'Paginated offers' } } }, post: { summary: 'Create offer', tags: ['Offers'], responses: { '201': { description: 'Offer created' } } } },
      '/offers/active': { get: { summary: 'Get active offers', tags: ['Offers'], responses: { '200': { description: 'Currently active offers' } } } },
      '/playlists': { get: { summary: 'List playlists', tags: ['Playlists'], responses: { '200': { description: 'Paginated playlists' } } }, post: { summary: 'Create playlist', tags: ['Playlists'], responses: { '201': { description: 'Playlist created' } } } },
      '/playlists/{id}': { get: { summary: 'Get playlist with items', tags: ['Playlists'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Playlist with items' } } } },
      '/playlists/{id}/items': { post: { summary: 'Add item to playlist', tags: ['Playlists'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Item added' } } } },
      '/playlists/{id}/publish': { post: { summary: 'Publish playlist', tags: ['Playlists'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Playlist published, screens notified' } } } },
      '/playlists/{id}/duplicate': { post: { summary: 'Duplicate playlist', tags: ['Playlists'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Playlist duplicated' } } } },
      '/schedules': { get: { summary: 'List schedules', tags: ['Schedules'], responses: { '200': { description: 'Paginated schedules' } } }, post: { summary: 'Create schedule', tags: ['Schedules'], responses: { '201': { description: 'Schedule created with overlap warnings' } } } },
      '/schedules/screen/{screenId}/active': { get: { summary: 'Get active schedule for screen', tags: ['Schedules'], parameters: [{ name: 'screenId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Currently active schedule or null' } } } },
      '/schedules/screen/{screenId}/calendar': { get: { summary: 'Get screen schedule calendar', tags: ['Schedules'], parameters: [{ name: 'screenId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'month', in: 'query', required: true, schema: { type: 'number' } }, { name: 'year', in: 'query', required: true, schema: { type: 'number' } }], responses: { '200': { description: 'Calendar month with daily schedules' } } } },
      '/locations': { get: { summary: 'List locations', tags: ['Locations'], responses: { '200': { description: 'Paginated locations' } } }, post: { summary: 'Create location', tags: ['Locations'], responses: { '201': { description: 'Location created' } } } },
      '/ingestion/connections': { get: { summary: 'List ingestion connections', tags: ['Ingestion'], responses: { '200': { description: 'Connections list' } } }, post: { summary: 'Create connection', tags: ['Ingestion'], responses: { '201': { description: 'Connection created (config encrypted)' } } } },
      '/ingestion/connections/test': { post: { summary: 'Test connection (unsaved)', tags: ['Ingestion'], responses: { '200': { description: 'Connection test result' } } } },
      '/ingestion/connections/{id}/sync': { post: { summary: 'Trigger sync', tags: ['Ingestion'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { syncType: { type: 'string', enum: ['full', 'incremental', 'price-only'] } } } } } }, responses: { '200': { description: 'Sync job queued' } } } },
      '/ingestion/connections/{id}/mappings': { get: { summary: 'Get field mappings', tags: ['Ingestion'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Field mappings (or defaults)' } } } },
      '/logs/screen': { get: { summary: 'Get screen logs', tags: ['Logs'], responses: { '200': { description: 'Paginated screen logs' } } } },
      '/logs/system': { get: { summary: 'Get system logs', tags: ['Logs'], responses: { '200': { description: 'Paginated system logs' } } } },
      '/logs/ingestion': { get: { summary: 'Get ingestion logs', tags: ['Logs'], responses: { '200': { description: 'Paginated ingestion logs' } } } },
      '/logs/stats': { get: { summary: 'Get log statistics', tags: ['Logs'], responses: { '200': { description: 'Error counts and sync success rate' } } } },
      '/media/assign': { post: { summary: 'Assign image to entity', tags: ['Media'], responses: { '200': { description: 'Image assigned' } } } },
      '/device/register': { post: { summary: 'Register screen device', tags: ['Device'], security: [], responses: { '200': { description: 'Device JWT token' } } } },
      '/device/playlist': { get: { summary: 'Get active playlist for screen', tags: ['Device'], security: [{ DeviceToken: [] }], responses: { '200': { description: 'Hydrated playlist for display' } } } },
      '/device/schedule': { get: { summary: 'Get today schedule', tags: ['Device'], security: [{ DeviceToken: [] }], responses: { '200': { description: 'Today schedule list' } } } },
      '/device/heartbeat': { post: { summary: 'Send heartbeat', tags: ['Device'], security: [{ DeviceToken: [] }], responses: { '200': { description: 'Heartbeat recorded' } } } },
    },
  },
  apis: [], // Using inline paths above
};

export const swaggerSpec = swaggerJsdoc(options);
