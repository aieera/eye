import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { createCategorySchema, updateCategorySchema, listCategoriesSchema } from './categories.schema';
import * as categoryController from './categories.controller';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listCategoriesSchema, 'query'), categoryController.listCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', categoryController.getCategory);
router.post('/', validate(createCategorySchema, 'body'), categoryController.createCategory);
router.put('/:id', validate(updateCategorySchema, 'body'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
