import 'reflect-metadata';
import './database';
import express, { Express } from 'express';
import cors from 'cors';
import errorHandler from './middlewares/error-handler';

import config from './config';

import { apiRouter } from './routes';

const app: Express = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.get('/', (_, res) => res.json({ ok: true }));
app.use('/api', apiRouter());
app.use(errorHandler());

if (!config.isLambda) {
  app.listen(config.server.port, () => console.log(`Api listening on port ${config.server.port}`));
}

export = app;
