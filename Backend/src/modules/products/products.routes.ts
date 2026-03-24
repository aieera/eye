import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  updatePricesSchema,
  bulkCreateSchema,
} from './products.schema';
import * as productController from './products.controller';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listProductsSchema, 'query'), productController.listProducts);
router.get('/without-images', productController.getProductsWithoutImages);
router.get('/:id', productController.getProduct);
router.post('/', validate(createProductSchema, 'body'), productController.createProduct);
router.post('/bulk', validate(bulkCreateSchema, 'body'), productController.bulkCreateProducts);
router.put('/:id', validate(updateProductSchema, 'body'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/image', productController.updateProductImage);
router.delete('/:id/image', productController.removeProductImage);
router.get('/:id/prices', productController.getProductPrices);
router.put('/:id/prices', validate(updatePricesSchema, 'body'), productController.updateProductPrices);

export default router;
