import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import {
  createScreenSchema,
  updateScreenSchema,
  listScreensSchema,
  registerDeviceSchema,
  heartbeatSchema,
} from './screens.schema';
import * as screenController from './screens.controller';

const router = Router();

// Public routes (device-facing)
router.post('/register', validate(registerDeviceSchema, 'body'), screenController.registerDevice);

// Protected routes (admin)
router.get('/', requireAuth, validate(listScreensSchema, 'query'), screenController.listScreens);
router.get('/stats', requireAuth, screenController.getScreenStats);
router.get('/:id', requireAuth, screenController.getScreen);
router.post('/', requireAuth, validate(createScreenSchema, 'body'), screenController.createScreen);
router.put('/:id', requireAuth, validate(updateScreenSchema, 'body'), screenController.updateScreen);
router.delete('/:id', requireAuth, screenController.deleteScreen);

// Heartbeat (requireAuth for now, Phase 3 switches to device auth)
router.post('/:screenId/heartbeat', requireAuth, validate(heartbeatSchema, 'body'), screenController.heartbeatHandler);

export default router;
