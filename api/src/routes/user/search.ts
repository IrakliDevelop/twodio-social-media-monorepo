import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import R from 'ramda';
import {
  UserModel,
  userProjections,
} from '../../models';
import { iFollowProjection } from '../../models/user';
import { Query } from '../../dgraph';

export const userSearchRouter = () => {
  const userModel = container.resolve(UserModel);

  const router = Router();

  router.get('/:term/:after?', async (req: Request, res: Response) => {
    const projection = R.omit(['email'], userProjections.general);
    const query = (name: string) => new Query('user', name)
      .first(10)
      .after(req.params.after)
      .vars({ term: ['string', req.params.term] })

    res.json(await userModel.runQueries(
      query('byUsername')
        .func('match(User.username, $term, 3)')
        .project({
          ...projection,
          ...iFollowProjection(req.user!.id, 1),
        }),
      query('byFullName')
        .func('match(User.fullName, $term, 16)')
        .project({
          ...projection,
          ...iFollowProjection(req.user!.id, 2),
        }),
    ));
  });

  return router;
};
