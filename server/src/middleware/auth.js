const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getRedisClient } = require('../config/redis');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is blacklisted in Redis
      const redisClient = getRedisClient();
      if (redisClient) {
        const isBlacklisted = await redisClient.get(`blacklist_${token}`);
        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            message: 'Token has been invalidated'
          });
        }
      }

      // Get user from database
      const user = await User.findById(decoded.id).select('+role');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional authentication - don't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but don't fail the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Blacklist token in Redis
const blacklistToken = async (token) => {
  try {
    const redisClient = getRedisClient();
    if (redisClient) {
      // Set token to expire in 7 days (same as JWT expiry)
      await redisClient.setex(`blacklist_${token}`, 7 * 24 * 60 * 60, 'true');
    }
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = async (req, res, next) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return next();
    }

    const key = `auth_rate_limit:${req.ip}`;
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, 900); // 15 minutes
    }

    if (current > 10) { // Max 10 attempts per 15 minutes
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: await redisClient.ttl(key)
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next();
  }
};

// Email verification required
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this resource'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  generateToken,
  blacklistToken,
  authRateLimit,
  requireEmailVerification
};