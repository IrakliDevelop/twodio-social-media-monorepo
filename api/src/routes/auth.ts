import { Router } from 'express';
import { container } from 'tsyringe';
import { UserModel } from '../models';

export const authRouter = () => {
  const router = Router();

  router.post('/signup', async (req, res) => {
    const user = {
      ...req.body,
      ...req.cognitoUser,
    };

    await container.resolve(UserModel).create({
      email: user.email,
      username: user.username,
      fullName: user.fullName,
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
