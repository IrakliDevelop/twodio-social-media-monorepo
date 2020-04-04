import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../.env' )});

export = {
  isLambda: !!(process.env.LAMBDA_TASK_ROOT && process.env.AWS_EXECUTION_ENV),
  server: {
    env: env.SERVER_ENV || 'dev',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'EXAMPLE_SECRET',
    options: {
      expiresIn: '20d',
    },
  },
}
