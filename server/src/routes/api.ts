import { Router } from 'express';
import { z } from 'zod';
import { DriveService } from '../services/driveService.js';
import { FormsService } from '../services/formsService.js';

const formPayloadSchema = z.object({
  month: z.string(),
  publishers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    games: z.array(z.object({
      fileId: z.string(),
      gameName: z.string(),
      originalFileName: z.string(),
      thumbnailUrl: z.string().optional(),
    })),
  })),
  unidentified: z.array(z.object({
    fileId: z.string(),
    originalFileName: z.string(),
    thumbnailUrl: z.string().optional(),
    publisherName: z.string().optional(),
    gameName: z.string().optional(),
  })),
});

export function apiRouter(driveService: DriveService, formsService: FormsService, rootFolderId: string) {
  const router = Router();
  router.get('/months', async (_request, response, next) => {
    try { response.json(await driveService.listMonths(rootFolderId)); } catch (error) { next(error); }
  });
  router.get('/months/:folderId/games', async (request, response, next) => {
    try { response.json(await driveService.getMonthGames(request.params.folderId)); } catch (error) { next(error); }
  });
  router.get('/images/:fileId', async (request, response, next) => {
    try {
      const image = await driveService.getImage(request.params.fileId);
      if (image.headers['content-type']) response.setHeader('Content-Type', image.headers['content-type']);
      image.data.pipe(response);
    } catch (error) { next(error); }
  });
  router.post('/forms', async (request, response, next) => {
    try { response.status(501).json(await formsService.create(formPayloadSchema.parse(request.body))); } catch (error) { next(error); }
  });
  return router;
}
