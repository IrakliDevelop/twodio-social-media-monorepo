import { container } from 'tsyringe';
import { RedisClient, createClient } from 'redis';
import config from './config';

const createRedisClient = () => createClient({
  password: config.redis.password,
});

container.register<RedisClient>('publisher', { useValue: createRedisClient() });
container.register<RedisClient>('subscriber', { useValue: createRedisClient() });

export { RedisClient as Redis };
