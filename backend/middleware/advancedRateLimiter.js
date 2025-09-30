import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

// Redis store for rate limiting (optional - requires redis)
let RedisStore;
try {
  // Try to import redis store if redis is available
  const { default: RedisStoreImport } = await import("rate-limit-redis");
  const { createClient } = await import("redis");

  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  await redisClient.connect();
  RedisStore = RedisStoreImport;

  console.log(" Redis connected for rate limiting");
} catch (error) {
  console.log("  Redis not available for rate limiting, using memory store");
  RedisStore = null;
}

// Create rate limiting store
const createStore = () => {
  if (RedisStore && process.env.REDIS_URL) {
    try {
      return new RedisStore({
        client: redisClient,
        prefix: process.env.REDIS_RATE_LIMIT_PREFIX || "rl:",
      });
    } catch (error) {
      console.warn(
        "Failed to create Redis store, falling back to memory store:",
        error.message
      );
      return undefined; // Use default memory store
    }
  }
  return undefined; // Use default memory store
};

// Enhanced rate limiter with monitoring
const createAdvancedRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      success: false,
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil(
        (parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000
      ),
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(),
    keyGenerator: (req) => {
      // Enhanced key generation with user context
      const userKey = req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
      const route = req.route ? req.route.path : req.path;
      return `${userKey}:${route}`;
    },
    skipSuccessfulRequests:
      process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === "true",
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED_REQUESTS === "true",
    // Enhanced request handler with logging
    handler: (req, res) => {
      const userInfo = req.user ? `User ${req.user._id}` : `IP ${req.ip}`;
      console.warn(
        ` Rate limit exceeded: ${userInfo} on ${req.method} ${req.originalUrl}`
      );

      res.status(429).json({
        success: false,
        message:
          options.message?.message ||
          "Rate limit exceeded. Please try again later.",
        retryAfter: options.retryAfter || Math.ceil(options.windowMs / 1000),
        timestamp: new Date().toISOString(),
        endpoint: req.originalUrl,
        method: req.method,
      });
    },
    // Skip rate limiting for certain conditions
    skip: (req) => {
      // Skip rate limiting if disabled in environment
      if (process.env.RATE_LIMITING_ENABLED === "false") {
        return true;
      }

      // Skip for health checks
      if (req.path === "/health") {
        return true;
      }

      // Skip for OPTIONS requests (CORS preflight)
      if (req.method === "OPTIONS") {
        return true;
      }

      return false;
    },
    ...options,
  };

  return rateLimit(defaultOptions);
};

// Rate limiting middleware with detailed logging
const rateLimitLogger = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    // Log rate limit info if headers are present
    const remaining = res.get("RateLimit-Remaining");
    const limit = res.get("RateLimit-Limit");
    const reset = res.get("RateLimit-Reset");

    if (remaining !== undefined) {
      const userInfo = req.user ? `User ${req.user._id}` : `IP ${req.ip}`;
      console.log(
        ` Rate limit: ${userInfo} - ${remaining}/${limit} remaining, resets at ${new Date(
          reset * 1000
        ).toISOString()}`
      );
    }

    return originalSend.call(this, data);
  };
  next();
};

// Comprehensive rate limiting configuration
export const advancedRateLimiters = {
  // Global API limiter with Redis support
  global: createAdvancedRateLimiter({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    message: {
      message: "Too many requests from this client, please try again later.",
    },
  }),

  // Authentication with enhanced security
  auth: createAdvancedRateLimiter({
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,
    skipSuccessfulRequests: true,
    message: {
      message:
        "Too many authentication attempts. Please wait before trying again.",
    },
  }),

  // Task operations
  tasks: createAdvancedRateLimiter({
    windowMs: parseInt(process.env.TASK_RATE_LIMIT_WINDOW_MS) || 60 * 1000,
    max: parseInt(process.env.TASK_RATE_LIMIT_MAX_REQUESTS) || 30,
    message: {
      message: "Too many task operations. Please slow down.",
    },
  }),

  // Admin operations
  admin: createAdvancedRateLimiter({
    windowMs: parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000,
    max: parseInt(process.env.ADMIN_RATE_LIMIT_MAX_REQUESTS) || 50,
    message: {
      message: "Admin operation rate limit exceeded.",
    },
  }),

  // Sensitive operations
  sensitive: createAdvancedRateLimiter({
    windowMs:
      parseInt(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
    max: parseInt(process.env.SENSITIVE_RATE_LIMIT_MAX_REQUESTS) || 3,
    message: {
      message: "Too many sensitive operations attempted.",
    },
  }),

  // Search operations
  search: createAdvancedRateLimiter({
    windowMs: parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS) || 60 * 1000,
    max: parseInt(process.env.SEARCH_RATE_LIMIT_MAX_REQUESTS) || 60,
    message: {
      message: "Search rate limit exceeded. Please slow down.",
    },
  }),
};

export { rateLimitLogger, createAdvancedRateLimiter };
export default advancedRateLimiters;
