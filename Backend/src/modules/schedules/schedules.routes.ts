import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { createScheduleSchema, updateScheduleSchema, listSchedulesSchema, calendarSchema } from './schedules.schema';
import * as scheduleController from './schedules.controller';

const router = Router();

router.use(requireAuth);

// Screen-specific routes BEFORE /:id to avoid parsing "screen" as ID
router.get('/screen/:screenId', scheduleController.getScreenSchedules);
router.get('/screen/:screenId/active', scheduleController.getActiveSchedule);
router.get('/screen/:screenId/calendar', validate(calendarSchema, 'query'), scheduleController.getScheduleCalendar);

// CRUD
router.get('/', validate(listSchedulesSchema, 'query'), scheduleController.listSchedules);
router.get('/:id', scheduleController.getSchedule);
router.post('/', validate(createScheduleSchema, 'body'), scheduleController.createSchedule);
router.put('/:id', validate(updateScheduleSchema, 'body'), scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

export default router;
