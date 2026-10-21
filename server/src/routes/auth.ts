import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';

export function authRouter(oauth: OAuth2Client) {
  const router = Router();
  router.get('/google', (_request, response) => {
    response.redirect(oauth.generateAuthUrl({
      access_type: 'offline', prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/forms.body'],
    }));
  });
  router.get('/google/callback', async (request, response, next) => {
    try {
      const code = String(request.query.code ?? '');
      if (!code) throw new Error('Código de autorização ausente.');
      oauth.setCredentials((await oauth.getToken(code)).tokens);
      response.redirect(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}?authenticated=1`);
    } catch (error) { next(error); }
  });
  return router;
}
