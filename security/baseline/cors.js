/**
 * CORS (Cross-Origin Resource Sharing) Module
 *
 * Configures CORS with explicit allowlist to prevent unauthorized
 * cross-origin access to the API.
 */

const cors = require('cors');

/**
 * Get CORS configuration with explicit allowlist
 * @param {Array<string>} allowedOrigins - Array of allowed origins
 * @param {boolean} isDevelopment - Whether running in development mode
 * @returns {object} CORS configuration
 */
function getCorsConfig(allowedOrigins = [], isDevelopment = false) {
  // Default production origins (update with your actual domains)
  const productionOrigins = [
    'https://titantech.party',
    'https://www.titantech.party',
  ];

  // Development origins (localhost variations)
  const developmentOrigins = [
    'http://localhost:25011',
    'http://localhost:3000',
    'http://127.0.0.1:25011',
    'http://127.0.0.1:3000',
  ];

  // Combine origins based on environment
  const origins = isDevelopment
    ? [...productionOrigins, ...developmentOrigins, ...allowedOrigins]
    : [...productionOrigins, ...allowedOrigins];

  return {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowlist
      if (origins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Correlation-ID',
    ],
    exposedHeaders: ['X-Correlation-ID', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    maxAge: 600, // Cache preflight requests for 10 minutes
  };
}

/**
 * Apply CORS middleware with allowlist
 * @param {Array<string>} allowedOrigins - Additional origins to allow
 * @param {boolean} isDevelopment - Whether in development mode
 * @returns {Function} CORS middleware
 */
function applyCors(allowedOrigins = [], isDevelopment = false) {
  return cors(getCorsConfig(allowedOrigins, isDevelopment));
}

/**
 * Strict CORS for sensitive endpoints (admin, auth)
 * Only allows same-origin requests
 */
function strictCors() {
  return cors({
    origin: function (origin, callback) {
      // Only allow same-origin or no origin
      if (!origin) {
        return callback(null, true);
      }

      // In production, reject all cross-origin requests to sensitive endpoints
      callback(new Error('Cross-origin requests not allowed for this endpoint'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  });
}

/**
 * Public CORS for public API endpoints (read-only)
 * More permissive but still controlled
 */
function publicCors() {
  return cors({
    origin: true, // Allow all origins for public read-only endpoints
    credentials: false, // Don't send cookies
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 3600, // Cache for 1 hour
  });
}

module.exports = {
  getCorsConfig,
  applyCors,
  strictCors,
  publicCors,
};
