const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    return redisClient;
  } catch (error) {
    console.error('Redis setup error:', error);
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient,
};