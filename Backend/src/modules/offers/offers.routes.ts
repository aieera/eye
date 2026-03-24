import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { createOfferSchema, updateOfferSchema, listOffersSchema } from './offers.schema';
import * as offerController from './offers.controller';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listOffersSchema, 'query'), offerController.listOffers);
router.get('/active', offerController.getActiveOffers);
router.get('/:id', offerController.getOffer);
router.post('/', validate(createOfferSchema, 'body'), offerController.createOffer);
router.put('/:id', validate(updateOfferSchema, 'body'), offerController.updateOffer);
router.delete('/:id', offerController.deleteOffer);

export default router;
