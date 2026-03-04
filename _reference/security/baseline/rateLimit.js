/**
 * Rate Limiting Module
 *
 * Prevents brute force attacks, DoS, and API abuse through configurable
 * rate limiting on sensitive endpoints.
 */

const rateLimit = require('express-rate-limit');

/**
 * Standard rate limit for general API endpoints
 * 100 requests per 15 minutes per IP
 */
const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) + ' minutes',
    });
  },
});

/**
 * Strict rate limit for authentication endpoints
 * 5 attempts per 15 minutes per IP to prevent brute force
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for auth endpoint from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) + ' minutes',
    });
  },
});

/**
 * Strict rate limit for file upload endpoints
 * 10 uploads per hour per IP to prevent abuse
 */
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads from this IP, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for upload endpoint from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Upload rate limit exceeded. Please try again in an hour.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) + ' minutes',
    });
  },
});

/**
 * Moderate rate limit for webhook endpoints
 * 30 requests per minute per IP
 */
const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    success: false,
    message: 'Webhook rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for webhook endpoint from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many webhook requests. Please try again shortly.',
    });
  },
});

/**
 * Heavy rate limit for expensive operations (e.g., data exports, reports)
 * 5 requests per hour per IP
 */
const heavyOperationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    success: false,
    message: 'Too many requests for this resource, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Create a custom rate limiter with specific configuration
 * @param {object} options - Rate limit options
 * @returns {Function} Rate limit middleware
 */
function createRateLimit(options) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests',
    skipSuccessfulRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    skipSuccessfulRequests,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = {
  standardRateLimit,
  authRateLimit,
  uploadRateLimit,
  webhookRateLimit,
  heavyOperationRateLimit,
  createRateLimit,
};
