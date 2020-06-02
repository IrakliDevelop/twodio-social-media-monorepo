import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import R from 'ramda';
import { PostModel, postProjections, Edge, userProjections } from '../models';

export const postsRouter = () => {
  const postModel = container.resolve(PostModel);

  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const posts = await postModel.fetchByUserID(
      req.user && req.user.id as any,
      postProjections.general,
      {
        first: parseInt(req.query.first as string),
        offset: parseInt(req.query.offset as string),
        after: req.query.after as string,
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

  router.get('/:id/comments', async (req: Request, res: Response) => {
    const comments = await postModel.fetchComments(
      req.params.id,
      {
        ...postProjections.general,
        user: userProjections.public,
      },
      {
        first: parseInt(req.query.first as string),
        offset: parseInt(req.query.offset as string),
        after: req.query.after as string,
        orderAsc: 'Post.created',
      }
    );

    res.json(comments || []);
  });

  router.post('/:id/comment', async (req: Request, res: Response) => {
    const date = new Date();
    const comment = {
      ...req.body,
      created: date,
      updated: date,
      user: {
        id: req.user!.id,
      },
      parent: {
        id: req.params.id,
      },
    };

    comment.id = await postModel.addComment(comment);

    res.notify('comment-add', {
      comment,
      user: R.pick(Object.keys(userProjections.public), req.user),
    });

    res.json(comment);
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

    post.id = await postModel.create({
      text: post.text,
      user: post.user,
      created: post.created,
      updated: post.updated,
    });

    res.notify('post-add', {
      post,
      user: R.pick(Object.keys(userProjections.public), req.user),
    });

    res.json(post);
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

    res.notify('post-edit', {
      post,
      user: R.pick(Object.keys(userProjections.public), req.user),
    });

    res.json(post);
  });

  router.put('/:id/like', async (req: Request, res: Response) => {
    await postModel.like(req.user!.id, req.params.id);
    res.notify('post-like', { post: { id: req.params.id } });
    res.json({ ok: true });
  });

  router.put('/:id/unlike', async (req: Request, res: Response) => {
    await postModel.unlike(req.user!.id, req.params.id);
    res.notify('post-unlike', { post: { id: req.params.id } });
    res.json({ ok: true });
  });

  return router;
};
