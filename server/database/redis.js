const redis = require('redis');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    client.on('ready', () => {
      console.log('✅ Redis ready for operations');
    });

    client.on('end', () => {
      console.log('Redis connection ended');
    });

    await client.connect();
  } catch (error) {
    console.error('❌ Redis connection error:', error.message);
    // Don't exit process, Redis is optional for development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Cache operations
const setCache = async (key, value, expireTime = 3600) => {
  try {
    if (client && client.isReady) {
      await client.setEx(key, expireTime, JSON.stringify(value));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    if (client && client.isReady) {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    if (client && client.isReady) {
      await client.del(key);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

const clearCache = async () => {
  try {
    if (client && client.isReady) {
      await client.flushAll();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Redis clear error:', error);
    return false;
  }
};

// Session operations
const setSession = async (sessionId, sessionData, expireTime = 86400) => {
  return await setCache(`session:${sessionId}`, sessionData, expireTime);
};

const getSession = async (sessionId) => {
  return await getCache(`session:${sessionId}`);
};

const deleteSession = async (sessionId) => {
  return await deleteCache(`session:${sessionId}`);
};

// Rate limiting
const incrementRateLimit = async (key, expireTime = 60) => {
  try {
    if (client && client.isReady) {
      const current = await client.incr(key);
      if (current === 1) {
        await client.expire(key, expireTime);
      }
      return current;
    }
    return 1;
  } catch (error) {
    console.error('Redis rate limit error:', error);
    return 1;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (client && client.isReady) {
    console.log('Closing Redis connection...');
    await client.quit();
  }
});

module.exports = {
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession,
  incrementRateLimit,
  client: () => client
};