import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './shared/utils/logger';
import { swaggerSpec } from './config/swagger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import locationRoutes from './modules/locations/locations.routes';
import screenRoutes from './modules/screens/screens.routes';
import productRoutes from './modules/products/products.routes';
import categoryRoutes from './modules/categories/categories.routes';
import offerRoutes from './modules/offers/offers.routes';
import playlistRoutes from './modules/playlists/playlists.routes';
import scheduleRoutes from './modules/schedules/schedules.routes';
import ingestionRoutes from './modules/ingestion/ingestion.routes';
import mediaRoutes from './modules/media/media.routes';
import logRoutes from './modules/logs/logs.routes';
import deviceRoutes from './modules/screens/device.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use(config.API_PREFIX, apiLimiter);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Eye Signage API' }));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const prefix = config.API_PREFIX;
app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/locations`, locationRoutes);
app.use(`${prefix}/screens`, screenRoutes);
app.use(`${prefix}/products`, productRoutes);
app.use(`${prefix}/categories`, categoryRoutes);
app.use(`${prefix}/offers`, offerRoutes);
app.use(`${prefix}/playlists`, playlistRoutes);
app.use(`${prefix}/schedules`, scheduleRoutes);
app.use(`${prefix}/ingestion`, ingestionRoutes);
app.use(`${prefix}/media`, mediaRoutes);
app.use(`${prefix}/logs`, logRoutes);
app.use(`${prefix}/dashboard`, dashboardRoutes);
app.use(`${prefix}/device`, deviceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (MUST be last)
app.use(errorHandler);

export default app;
