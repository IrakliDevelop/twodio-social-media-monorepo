import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import { PostModel } from '../models/post';
import { Edge } from '../models/utils';

export const postsRouter = () => {
  const postModel = container.resolve(PostModel);

  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const posts = await postModel.fetchByUserID(
      req.user && req.user.id as any,
      {
        id: 1,
        text: 1,
      },
      {
        first: parseInt(req.query.first),
        offset: parseInt(req.query.offset),
        after: req.query.after,
      }
    );

    res.json(posts || []);
  });


  router.get('/:id', async (req: Request, res: Response) => {
    const post = await postModel.fetchByID(req.params.id, {
      id: 1,
      text: 1,
      user: {
        id: 1,
      },
    });

    res.json(post || null);
  });

  return router;
};