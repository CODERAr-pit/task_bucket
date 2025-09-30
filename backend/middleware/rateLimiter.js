import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import slowDown from "express-slow-down";

// Basic rate limiter configuration
const createRateLimiter = (options = {}) => {
  // Skip rate limiting if disabled in environment
  if (process.env.RATE_LIMITING_ENABLED === "false") {
    return (req, res, next) => next(); // Bypass middleware
  }

  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(options.windowMs / 1000) || 900, // seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Custom key generator to support both IP and user-based limiting with proper IPv6 support
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP with proper IPv6 handling
      if (req.user && req.user._id) {
        return `user:${req.user._id}`;
      }
      return ipKeyGenerator(req);
    },
    // Skip successful requests for certain endpoints
    skipSuccessfulRequests:
      process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === "true",
    // Skip failed requests for certain endpoints
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED_REQUESTS === "true",
    ...options,
  };

  return rateLimit(defaultOptions);
};

// Speed limiter for progressive delays
const createSpeedLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 2, // Allow 2 requests per windowMs without delay
    delayMs: () => 100, // Fixed delay of 100ms (new express-slow-down v2 format)
    maxDelayMs: 20000, // Maximum delay of 20 seconds
    keyGenerator: (req) => {
      if (req.user && req.user._id) {
        return `user:${req.user._id}`;
      }
      return ipKeyGenerator(req);
    },
    // Disable delayMs validation warning
    validate: {
      delayMs: false,
    },
    ...options,
  };

  return slowDown(defaultOptions);
};

// Strict rate limiter for authentication endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5, // Limit each IP to 5 login attempts per 15 minutes
  message: {
    success: false,
    message:
      "Too many authentication attempts, please try again in 15 minutes.",
    retryAfter: Math.ceil(
      (parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 900000) / 1000
    ),
  },
  skipSuccessfulRequests:
    process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === "true", // Don't count successful requests
});

// Rate limiter for password reset/sensitive operations
export const sensitiveOperationLimiter = createRateLimiter({
  windowMs:
    parseInt(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.SENSITIVE_RATE_LIMIT_MAX_REQUESTS) || 3, // Limit each IP to 3 sensitive operations per hour
  message: {
    success: false,
    message:
      "Too many sensitive operations attempted, please try again in 1 hour.",
    retryAfter: Math.ceil(
      (parseInt(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS) || 3600000) / 1000
    ),
  },
});

// General API rate limiter
export const generalApiLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Limit each IP to 1000 requests per 15 minutes
  message: {
    success: false,
    message: "API rate limit exceeded, please try again later.",
    retryAfter: Math.ceil(
      (parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000
    ),
  },
});

// Task operations rate limiter
export const taskOperationsLimiter = createRateLimiter({
  windowMs: parseInt(process.env.TASK_RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.TASK_RATE_LIMIT_MAX_REQUESTS) || 30, // Limit each user to 30 task operations per minute
  message: {
    success: false,
    message: "Task operation rate limit exceeded, please slow down.",
    retryAfter: Math.ceil(
      (parseInt(process.env.TASK_RATE_LIMIT_WINDOW_MS) || 60000) / 1000
    ),
  },
});

// Admin operations rate limiter
export const adminOperationsLimiter = createRateLimiter({
  windowMs: parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
  max: parseInt(process.env.ADMIN_RATE_LIMIT_MAX_REQUESTS) || 50, // Limit admin operations
  message: {
    success: false,
    message: "Admin operation rate limit exceeded, please try again later.",
    retryAfter: Math.ceil(
      (parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW_MS) || 300000) / 1000
    ),
  },
});

// Speed limiter for general API (progressive delay)
export const apiSpeedLimiter = createSpeedLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  delayAfter: 50, // Allow 50 requests per minute without delay
  delayMs: () => 100, // Fixed delay of 100ms (new express-slow-down v2 format)
  maxDelayMs: 5000, // Maximum delay of 5 seconds
});

// Email sending rate limiter
export const emailRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 emails per hour
  message: {
    success: false,
    message: "Email rate limit exceeded, please try again later.",
    retryAfter: 3600,
  },
});

// File upload rate limiter
export const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit file uploads
  message: {
    success: false,
    message: "Upload rate limit exceeded, please try again later.",
    retryAfter: 900,
  },
});

// Search rate limiter
export const searchRateLimiter = createRateLimiter({
  windowMs: parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.SEARCH_RATE_LIMIT_MAX_REQUESTS) || 60, // Limit search operations
  message: {
    success: false,
    message: "Search rate limit exceeded, please slow down.",
    retryAfter: Math.ceil(
      (parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS) || 60000) / 1000
    ),
  },
});

export default {
  createRateLimiter,
  createSpeedLimiter,
  authRateLimiter,
  sensitiveOperationLimiter,
  generalApiLimiter,
  taskOperationsLimiter,
  adminOperationsLimiter,
  apiSpeedLimiter,
  emailRateLimiter,
  uploadRateLimiter,
  searchRateLimiter,
};
