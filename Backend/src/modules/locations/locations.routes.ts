import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { createLocationSchema, updateLocationSchema, listLocationsSchema } from './locations.schema';
import * as locationController from './locations.controller';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listLocationsSchema, 'query'), locationController.listLocations);
router.get('/:id', locationController.getLocation);
router.post('/', validate(createLocationSchema, 'body'), locationController.createLocation);
router.put('/:id', validate(updateLocationSchema, 'body'), locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);

export default router;
