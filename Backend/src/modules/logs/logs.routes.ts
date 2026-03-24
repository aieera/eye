import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as logsController from './logs.controller';
import { screenLogsSchema, systemLogsSchema, ingestionLogsSchema } from './logs.schema';

const router = Router();

router.use(requireAuth);

router.get('/screen', validate(screenLogsSchema, 'query'), logsController.getScreenLogs);
router.get('/system', validate(systemLogsSchema, 'query'), logsController.getSystemLogs);
router.get('/ingestion', validate(ingestionLogsSchema, 'query'), logsController.getIngestionLogs);
router.get('/stats', logsController.getLogStats);

export default router;
