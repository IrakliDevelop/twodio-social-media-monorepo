import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import { PostModel, postProjections, Edge } from '../models';

export const postsRouter = () => {
  const postModel = container.resolve(PostModel);

  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const posts = await postModel.fetchByUserID(
      req.user && req.user.id as any,
      postProjections.general,
      {
        first: parseInt(req.query.first),
        offset: parseInt(req.query.offset),
        after: req.query.after,
        orderDesc: 'Post.created',
      }
    );

    res.json(posts || []);
  });


  router.get('/:id', async (req: Request, res: Response) => {
    const post = await postModel.fetchByID(req.params.id, {
      ...postProjections.general,
      user: {
        id: 1,
      },
    });

    res.json(post || null);
  });

  router.post('/', async (req: Request, res: Response) => {
    const date = new Date();
    const post = {
      ...req.body,
      created: date,
      updated: date,
      user: {
        id: req.user!.id,
      },
    };

    const id = await postModel.create({
      text: post.text,
      user: post.user,
      created: post.created,
      updated: post.updated,
    });

    res.json({ ...post, id });
  });

  router.put('/:id', async (req: Request, res: Response) => {
    const post = {
      ...req.body,
      id: req.params.id,
    };

    await postModel.update(req.user!.id, {
      id: post.id,
      text: post.text,
      updated: new Date(),
    });

    res.json(post);
  });

  return router;
};
