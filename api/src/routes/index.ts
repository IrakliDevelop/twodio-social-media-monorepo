import { Router } from 'express';
import { authenticator } from '../middlewares/authenticator';
import { meRouter } from './me';
import { feedRouter } from './feed';
import { authRouter } from './auth';
import { postsRouter } from './posts';
import { userRouter } from './user';

export const apiRouter = () => {
  const router = Router();

  router.use('/auth', authenticator(false), authRouter());
  
  router.use(authenticator());
  router.use('/me', meRouter());
  router.use('/feed', feedRouter());
  router.use('/posts', postsRouter());
  router.use('/user', userRouter());

  return router;
};
