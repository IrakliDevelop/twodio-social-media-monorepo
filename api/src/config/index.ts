import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../../.env' )});

const root = resolve(__dirname, '../../');
const env = process.env;

const notNullEnv = (key: string) => {
  if (env[key] == null) {
    throw Error(`undefined env: ${key}`);
  }
  return env[key] as string;
};

export default {
  root,
  isLambda: !!(env.LAMBDA_TASK_ROOT && env.AWS_EXECUTION_ENV),
  server: {
    port: env.SERVER_PORT || 3000,
    env: env.ENV || 'dev',
    enableCors: !!env.ENABLE_CORS,
  },
  db: {
    url: notNullEnv('DATABASE_URL'),
  },
  redis: {
    host: env.REDIS_HOST || 'localhost',
    port: env.REDIS_PORT || 6379,
    password: notNullEnv('REDIS_PASSWORD'),
  },
  auth: {
    cognito: {
      poolId: notNullEnv('COGNITO_POOL_ID'),
      jwtOptions: {},
    },
  },
};
