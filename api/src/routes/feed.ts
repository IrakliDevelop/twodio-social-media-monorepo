import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import {
  userProjections,
  postProjections,
  UserModel,
  Edge,
  Query
} from '../models';

export const feedRouter = () => {
  const userModel = container.resolve(UserModel);

  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const posts = await userModel.runQueries(
      new Query('user')
        .asVar()
        .func('uid($id)')
        .vars({ id: ['string', req.user!.id] })
        .project({
          posts: new Edge('post', { id: 'userPostIDs as uid' }),
          follows: new Edge('user', {
            posts: new Edge('post', {
              id: 'followsPostIDs as uid',
            }),
          }),
        }),
      new Query('post', 'posts')
        .func('uid(userPostIDs, followsPostIDs)')
        .orderDesc('Post.created')
        .first(Math.min(parseInt(req.query.first) || 15, 15))
        .offset(parseInt(req.query.offset))
        .after(req.query.after)
        .project({
          ...postProjections.general,
          user: {
            ...userProjections.public,
          },
        })
    );

    res.json(posts || []);
  });

  return router;
};
