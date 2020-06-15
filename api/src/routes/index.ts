import { Router } from 'express';
import { authenticator } from '../middlewares/authenticator';
import { notifier } from '../middlewares/notifier';
import { meRouter } from './me';
import { feedRouter } from './feed';
import { authRouter } from './auth';
import { postsRouter } from './posts';
import { userRouter } from './user';
import { chatRouter } from './chat';

export const apiRouter = () => {
  const router = Router();

  router.use('/auth', authenticator(false), authRouter());

  router.use(authenticator());
  router.use(notifier());
  router.use('/me', meRouter());
  router.use('/feed', feedRouter());
  router.use('/posts', postsRouter());
  router.use('/user', userRouter());
  router.use('/chat', chatRouter());

  return router;
};
