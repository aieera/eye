import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../shared/utils/apiResponse';
import * as ingestionService from './ingestion.service';

export const listConnections = asyncHandler(async (_req: Request, res: Response) => {
  const connections = await ingestionService.listConnections();
  sendSuccess(res, connections);
});

export const getConnection = asyncHandler(async (req: Request, res: Response) => {
  const connection = await ingestionService.getConnection(req.params.id as string);
  sendSuccess(res, connection);
});

export const createConnection = asyncHandler(async (req: Request, res: Response) => {
  const connection = await ingestionService.createConnection(req.body);
  sendCreated(res, connection);
});

export const updateConnection = asyncHandler(async (req: Request, res: Response) => {
  const connection = await ingestionService.updateConnection(req.params.id as string, req.body);
  sendSuccess(res, connection, 'Connection updated');
});

export const deleteConnection = asyncHandler(async (req: Request, res: Response) => {
  await ingestionService.deleteConnection(req.params.id as string);
  sendNoContent(res);
});

export const testConnectionUnsaved = asyncHandler(async (req: Request, res: Response) => {
  const result = await ingestionService.testConnection(req.body);
  sendSuccess(res, result, result.success ? 'Connection successful' : 'Connection failed');
});

export const testSavedConnection = asyncHandler(async (req: Request, res: Response) => {
  const result = await ingestionService.testSavedConnection(req.params.id as string);
  sendSuccess(res, result, result.success ? 'Connection successful' : 'Connection failed');
});

export const getFieldMappings = asyncHandler(async (req: Request, res: Response) => {
  const mappings = await ingestionService.getFieldMappings(req.params.id as string);
  sendSuccess(res, mappings);
});

export const createFieldMapping = asyncHandler(async (req: Request, res: Response) => {
  const mapping = await ingestionService.createFieldMapping(req.params.id as string, req.body);
  sendCreated(res, mapping);
});

export const updateFieldMapping = asyncHandler(async (req: Request, res: Response) => {
  const mapping = await ingestionService.updateFieldMapping(req.params.mappingId as string, req.body);
  sendSuccess(res, mapping, 'Mapping updated');
});

export const deleteFieldMapping = asyncHandler(async (req: Request, res: Response) => {
  await ingestionService.deleteFieldMapping(req.params.mappingId as string);
  sendNoContent(res);
});

export const triggerSync = asyncHandler(async (req: Request, res: Response) => {
  const result = await ingestionService.triggerSync(
    req.params.id as string,
    req.body,
    req.user!.email
  );
  sendSuccess(res, result, `Sync job queued: ${result.syncType}`);
});

export const getSyncLogs = asyncHandler(async (req: Request, res: Response) => {
  const { logs, pagination } = await ingestionService.getSyncLogs(req.params.id as string, req.query as any);
  sendPaginated(res, logs, pagination);
});

export const getSyncStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await ingestionService.getSyncStatus(req.params.id as string);
  sendSuccess(res, status);
});
