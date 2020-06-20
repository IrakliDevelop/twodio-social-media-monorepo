import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import { ChatModel, UserModel, userProjections } from '../models';
import { iFollowProjection } from '../models/user';

export const chatRouter = () => {
  const router = Router();
  const userModel = container.resolve(UserModel);

  router.get('/list', async (req: Request, res: Response) => {
    let result = await ChatModel.aggregate()
      .match({ users: req.user!.id })
      .project({ users: 1, created: 1 })
      .sort({ created: -1 })
      .group({
        _id: '$users',
        created: { $first: '$created' },
      })
      .limit(parseInt(req.query.first) || 20)
      .skip(parseInt(req.query.offset) || 0);

    result = (result || []).map(x => ({
      id: (x._id || []).find((y: string) => y !== req.user!.id),
      created: x.created,
    }));

    if (!result.length) return res.json([]);

    const users: any[] = await userModel.fetchByIDQuery(result.map(x => x.id), {
        ...userProjections.public,
        ...iFollowProjection(req.user!.id),
      })
      .call(userModel.runExtract()) as any[];

    res.json(users.map(x => ({
      ...x,
      lastMessageDate: result.find(y => y.id === x.id).created,
    })));
  });

  router.get('/:user', async (req: Request, res: Response) => {
    const users = [req.user!.id, req.params.user];
    const messages = await ChatModel
      .find({ users: { $all: users } })
      .sort({ created: -1 })
      .limit(parseInt(req.query.first) || 20)
      .skip(parseInt(req.query.offset) || 0);

    res.json(messages || []);
  });

  router.post('/:user', async (req: Request, res: Response) => {
    const users = [req.user!.id, req.params.user];
    const chat = new ChatModel({
      users,
      message: req.body.message || '',
    });
    await chat.save();

    res.json({ ok: true });
    res.notifyTo(users, 'message-send', chat.toJSON());
  });

  return router;
};
