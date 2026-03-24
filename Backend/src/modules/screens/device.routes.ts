import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireDeviceAuth } from '../../middleware/deviceAuth';
import { deviceController } from './device.controller';
import { registerDeviceSchema, heartbeatSchema } from './screens.schema';

const router = Router();

// Public — screen registers with its screenCode
router.post('/register', validate(registerDeviceSchema, 'body'), asyncHandler(deviceController.register));

// Device auth required
router.post('/heartbeat', requireDeviceAuth, validate(heartbeatSchema, 'body'), asyncHandler(deviceController.heartbeat));
router.get('/playlist', requireDeviceAuth, asyncHandler(deviceController.getActivePlaylist));
router.get('/schedule', requireDeviceAuth, asyncHandler(deviceController.getTodaySchedule));
router.post('/log', requireDeviceAuth, asyncHandler(deviceController.submitLog));

export default router;
