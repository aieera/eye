import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../shared/utils/apiResponse';
import * as productService from './products.service';

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { products, pagination } = await productService.list(req.query as any);
  sendPaginated(res, products, pagination);
});

export const getProductsWithoutImages = asyncHandler(async (req: Request, res: Response) => {
  const { products, pagination } = await productService.getProductsWithoutImages(req.query);
  sendPaginated(res, products, pagination);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id as string);
  sendSuccess(res, product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.create(req.body);
  sendCreated(res, product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.update(req.params.id as string, req.body);
  sendSuccess(res, product, 'Product updated successfully');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.remove(req.params.id as string);
  sendNoContent(res);
});

export const bulkCreateProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.bulkUpsert(req.body);
  sendSuccess(res, result, `Bulk operation: ${result.created} created, ${result.updated} updated, ${result.failed} failed`);
});

export const updateProductImage = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateImage(req.params.id as string, req.body.imageUrl);
  sendSuccess(res, product, 'Product image updated');
});

export const removeProductImage = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.removeImage(req.params.id as string);
  sendSuccess(res, product, 'Product image removed');
});

export const getProductPrices = asyncHandler(async (req: Request, res: Response) => {
  const prices = await productService.getProductPrices(req.params.id as string);
  sendSuccess(res, prices);
});

export const updateProductPrices = asyncHandler(async (req: Request, res: Response) => {
  const prices = await productService.updatePrices(req.params.id as string, req.body);
  sendSuccess(res, prices, 'Prices updated successfully');
});
