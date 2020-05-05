import 'reflect-metadata';
import './database';
import './redis';
import { handleUpgrade } from './ws';
import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authenticator } from './middlewares/authenticator';
import errorHandler from './middlewares/error-handler';

import config from './config';

import { apiRouter } from './routes';

const app: Express = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.get('/', (_, res) => res.json({ ok: true }));
app.use(morgan('combined'));
app.use('/api', apiRouter());
app.use(errorHandler());

if (!config.isLambda) {
  const server = app.listen(
    config.server.port,
    () => console.log(`Api listening on port ${config.server.port}`)
  );

  server.on('upgrade', async (req, socket, head) => {
    authenticator()(req, {} as any, (err) => {
      if (err) return socket.destroy();
      handleUpgrade(req, socket, head);
    });
  });
}

export = app;
