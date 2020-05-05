import { Socket } from 'net';
import { Request } from 'express';
import { container } from 'tsyringe';
import { RedisClient } from 'redis';
import WebSocket from 'ws';
import R from 'ramda';
import { UserModel, PostModel, Edge } from '../models';
import { SubMap } from './submap';

const subscriber = container.resolve<RedisClient>('subscriber');
const userModel = container.resolve(UserModel);

/** find people(id) followed by userID */
async function findFollowsIDs(userID: string): Promise<string[]> {
  return userModel.fetchByID(userID, {
    follows: new Edge('user', {
      id: 1,
    }),
  }).then(R.pipe(
    R.propOr([], 'follows'),
    R.map(R.prop('id') as (obj: Record<'id', string>) => string),
    R.prepend(userID)
  ));
}

const wss = new WebSocket.Server({ noServer: true });
const subMap = new SubMap<WebSocket.WebSocket>();

wss.on('connection', async (ws) => {
  const follows = await findFollowsIDs(ws.user.id);
  const newSubs = follows
    .map(x => `user:${x}/*`)
    .filter(x => subMap.add(ws, x));

  subscriber.psubscribe(newSubs);

  ws.once('close', () => subMap.deleteWs(ws));
  subMap.on('delete_sub', sub => subscriber.punsubscribe(sub));
});

subscriber.on('pmessage', (pattern, channel, msg) => {
  const msgType = R.last(channel.split('/')) as string;

  subMap.getWsList(pattern)
    .forEach(ws => handleMessage(ws, msgType, JSON.parse(msg)));
});

function handleMessage(ws: WebSocket.WebSocket, msgType: string, msg: any) {
  ws.send(JSON.stringify({
    event: msgType,
    data: msg,
  }));
}

export function handleUpgrade(
  req: Request,
  socket: Socket,
  upgradeHead: Buffer
) {
  return wss.handleUpgrade(req, socket, upgradeHead, ws => {
    if (!req.user) {
      return ws.close(401, JSON.stringify({
        ok: false,
        code: 'credentials_required',
      }));
    }
    ws.user = req.user;
    wss.emit('connection', ws);
  });
}
