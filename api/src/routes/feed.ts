import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import {
  userProjections,
  postProjections,
  UserModel,
} from '../models';
import { Edge, Query, QueryVars } from '../dgraph';
import { iLikeProjection } from '..//models/post';

export const feedRouter = () => {
  const userModel = container.resolve(UserModel);

  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const vars: QueryVars = { id: ['string', req.user!.id] };
    const result = await userModel.runQueries(
      new Query('user')
        .asVar()
        .func('uid($id)')
        .vars(vars)
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
        .vars(vars)
        .orderDesc('Post.created')
        .first(Math.min(parseInt(req.query.first as string) || 15, 15))
        .offset(parseInt(req.query.offset as string))
        .after(req.query.after as string)
        .project({
          ...postProjections.general,
          ...iLikeProjection('$id'),
          user: {
            ...userProjections.public,
          },
        })
    );

    res.json(result.posts || []);
  });

  return router;
};

