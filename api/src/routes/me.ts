import { Router } from 'express';
import { UserModel } from '../models';

export const meRouter = () => {
  const router = Router();

  router.get('/', (req, res) => res.json(req.user));

  return router;
};
