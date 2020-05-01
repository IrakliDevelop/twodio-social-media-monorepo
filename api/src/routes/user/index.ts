import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import { UserModel } from '../../models/user';

export const userRouter = () => {
  const userModel = container.resolve(UserModel);

  const router = Router();

  router.post('/follow/:username', async (req: Request, res: Response) => {
    await userModel.follow(
      req.user!.id,
      req.params.username
    );

    res.json({ ok: true });
  });

  router.post('/unfollow/:username', async (req: Request, res: Response) => {
    await userModel.unfollow(
      req.user!.id,
      req.params.username
    );

    res.json({ ok: true });
  });

  return router;
};
