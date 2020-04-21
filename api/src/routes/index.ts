import { Router } from 'express';
import { meRouter } from './me';
import { authRouter } from './auth';

export const apiRouter = () => {
  const router = Router();

  router.use('/me', meRouter())
  router.use('/auth', authRouter());

  return router;
};
