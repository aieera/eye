import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import {
  createConnectionSchema, updateConnectionSchema, testConnectionSchema,
  triggerSyncSchema, createFieldMappingSchema, updateFieldMappingSchema, listLogsSchema,
} from './ingestion.schema';
import * as ingestionController from './ingestion.controller';

const router = Router();

router.use(requireAuth);

// Connection test (unsaved) — BEFORE /:id to avoid matching "test" as ID
router.post('/connections/test', validate(testConnectionSchema, 'body'), ingestionController.testConnectionUnsaved);

// Connection CRUD
router.get('/connections', ingestionController.listConnections);
router.get('/connections/:id', ingestionController.getConnection);
router.post('/connections', validate(createConnectionSchema, 'body'), ingestionController.createConnection);
router.put('/connections/:id', validate(updateConnectionSchema, 'body'), ingestionController.updateConnection);
router.delete('/connections/:id', ingestionController.deleteConnection);

// Test saved connection
router.post('/connections/:id/test', ingestionController.testSavedConnection);

// Field mappings
router.get('/connections/:id/mappings', ingestionController.getFieldMappings);
router.post('/connections/:id/mappings', validate(createFieldMappingSchema, 'body'), ingestionController.createFieldMapping);
router.put('/mappings/:mappingId', validate(updateFieldMappingSchema, 'body'), ingestionController.updateFieldMapping);
router.delete('/mappings/:mappingId', ingestionController.deleteFieldMapping);

// Sync
router.post('/connections/:id/sync', validate(triggerSyncSchema, 'body'), ingestionController.triggerSync);
router.get('/connections/:id/logs', validate(listLogsSchema, 'query'), ingestionController.getSyncLogs);
router.get('/connections/:id/status', ingestionController.getSyncStatus);

export default router;
