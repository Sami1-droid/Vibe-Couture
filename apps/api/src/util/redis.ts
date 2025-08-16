import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType | null = null;
export function getRedis(): RedisClientType {
	if (!client) {
		client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
		client.connect().catch(() => {});
	}
	return client;
}