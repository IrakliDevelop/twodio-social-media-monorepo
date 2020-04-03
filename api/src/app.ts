import express, { Express } from 'express';

import config from './config';

const app: Express = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (!config.isLambda) {
  app.listen(config.server.port, () => console.log(`Api listening on port ${config.server.port}`));
}

export = app;
