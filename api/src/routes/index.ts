import { Router } from 'express';
import { authenticator } from '../middlewares/authenticator';
import { meRouter } from './me';
import { authRouter } from './auth';

export const apiRouter = () => {
  const router = Router();

  router.use('/auth', authenticator(false), authRouter());
  
  router.use(authenticator());
  router.use('/me', meRouter());

  return router;
};
