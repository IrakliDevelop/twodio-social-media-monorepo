import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../.env' )});

export = {
  isLambda: !!(process.env.LAMBDA_TASK_ROOT && process.env.AWS_EXECUTION_ENV),
  server: {
    port: process.env.SERVER_PORT || 3000,
    env: process.env.SERVER_ENV || 'development', // production, development
    enableCors: process.env.ENABLE_CORS,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'EXAMPLE_SECRET',
    options: {
      expiresIn: '20d',
    },
  },
}
