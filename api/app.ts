import express, { Express } from 'express';
import bodyParser from 'body-parser';

import config from './config';

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (!config.isLambda) {
  app.listen(config.server.port, () => console.log(`Api listening on port ${config.server.port}`));
}

export = app;
