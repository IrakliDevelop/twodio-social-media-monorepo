import { container } from 'tsyringe';
import { RedisClient, createClient } from 'redis';
import config from './config';

const createRedisClient = () => createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  connect_timeout: 30000,
});

container.register<RedisClient>('publisher', { useValue: createRedisClient() });
container.register<RedisClient>('subscriber', { useValue: createRedisClient() });

export { RedisClient as Redis };
