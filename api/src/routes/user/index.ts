import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import R from 'ramda';
import {
  UserModel,
  userProjections,
  postProjections,
} from '../../models';
import { iFollowProjection } from '../../models/user';
import {
  Query,
  Edge,
} from '../../dgraph';
import { userSearchRouter } from './search';

export const userRouter = () => {
  const userModel = container.resolve(UserModel);

  const router = Router();

  router.get('/:username', async (req: Request, res: Response) => {
    return res.json(
      await userModel.runQuery(
        new Query('user', 'user')
        .func('eq(User.username, $username)')
        .vars({ username: ['string', req.params.username] })
        .project({
          ...userProjections.general,
          ...iFollowProjection(req.user!.id),
          posts: new Edge('post', postProjections.general),
        })
      )
      .then(R.path(['user', 0]))
    );
  });

  router.post('/:username/follow', async (req: Request, res: Response) => {
    await userModel.follow(
      req.user!.id,
      req.params.username
    );

    res.json({ ok: true });
  });

  router.post('/:username/unfollow', async (req: Request, res: Response) => {
    await userModel.unfollow(
      req.user!.id,
      req.params.username
    );

    res.json({ ok: true });
  });

  router.use('/search', userSearchRouter());

  return router;
};
