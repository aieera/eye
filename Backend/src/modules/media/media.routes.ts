import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { assignImageSchema } from './media.schema';
import * as mediaController from './media.controller';

const router = Router();

router.use(requireAuth);

router.post('/assign', validate(assignImageSchema, 'body'), mediaController.assignImage);
router.delete('/:entityType/:entityId', mediaController.removeImage);

export default router;
