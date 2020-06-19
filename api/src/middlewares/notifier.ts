import { Request, Response, NextFunction } from 'express';
import { RedisClient } from 'redis';
import { container } from 'tsyringe';

declare global {
  namespace Express {
    interface Response {
      notifyFollowers: (eventType: string, msg: any) => void;
    }
  }
}

export const notifier = () => (req: Request, res: Response, next: NextFunction) => {
  const publisher = container.resolve<RedisClient>('publisher');
  res.notifyFollowers = (eventType: string, msg: any) => {
    publisher.publish(`followers:${req.user!.id}/${eventType}`, JSON.stringify(msg));
  };
  next();
};
