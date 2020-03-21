import express, { Express } from 'express';
import bodyParser from 'body-parser';

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
