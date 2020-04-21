import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticator } from '../middlewares/authenticator';
import { UserModel } from '../models';

export const meRouter = () => {
  const router = Router();

  router.get('/', authenticator(), (req, res, next) => {
    container.resolve(UserModel)
      .fetchByAuthSub((req.user as any)?.sub, {
        id: 1,
        email: 1,
      })
      .then(x => res.json(x))
      .catch(next);
  });

  return router;
};
