import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../shared/utils/apiResponse';
import * as categoryService from './categories.service';

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const { categories, pagination } = await categoryService.list(req.query as any);
  sendPaginated(res, categories, pagination);
});

export const getCategoryTree = asyncHandler(async (_req: Request, res: Response) => {
  const tree = await categoryService.getTree();
  sendSuccess(res, tree);
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getById(req.params.id as string);
  sendSuccess(res, category);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body);
  sendCreated(res, category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.update(req.params.id as string, req.body);
  sendSuccess(res, category, 'Category updated successfully');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.remove(req.params.id as string);
  sendNoContent(res);
});
