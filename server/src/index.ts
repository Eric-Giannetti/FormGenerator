import 'dotenv/config';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { google } from 'googleapis';
import { authRouter } from './routes/auth.js';
import { apiRouter } from './routes/api.js';
import { DriveService } from './services/driveService.js';
import { FormsService } from './services/formsService.js';

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`A variável de ambiente ${key} é obrigatória.`);
  return value;
};
const oauth = new google.auth.OAuth2(required('GOOGLE_CLIENT_ID'), required('GOOGLE_CLIENT_SECRET'), required('GOOGLE_REDIRECT_URI'));
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/auth', authRouter(oauth));
app.use('/api', apiRouter(new DriveService(google.drive({ version: 'v3', auth: oauth })), new FormsService(google.forms({ version: 'v1', auth: oauth })), required('GOOGLE_DRIVE_ROOT_FOLDER_ID')));
app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ message: error.message || 'Erro interno do servidor.' });
});
app.listen(Number(process.env.PORT ?? 3001), () => console.log('API disponível na porta ' + (process.env.PORT ?? 3001)));
