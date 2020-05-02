import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import R from 'ramda';
import {
  UserModel,
  userProjections,
  postProjections,
  Query,
  Edge,
} from '../../models';

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

  router.get('/search/:term/:after?', async (req: Request, res: Response) => {
    const query = (name: string) => new Query('user', name)
      .first(10)
      .after(req.params.after)
      .vars({ term: ['string', req.params.term] })
      .project(R.omit(['email'], userProjections.general));

    res.json(await userModel.runQueries(
      query('byUsername')
        .func('match(User.username, $term, 3)'),
      query('byFullName')
        .func('match(User.fullName, $term, 16)')
    ).then(x => x.getJson()));
  });

  return router;
};
