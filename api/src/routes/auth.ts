import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticator } from '../middlewares/authenticator';
import { UserModel } from '../models';

export const authRouter = () => {
  const router = Router();

  router.post('/signup', authenticator(), async (req, res) => {
    const user = {
      ...req.body,
      ...req.user,
    };

    await container.resolve(UserModel).create({
      email: user.email,
      authData: {
        sub: user.sub,
        provider: {
          name: 'cognito',
        },
      },
    });

    res.json({ ok: true });
  });

  return router;
};
