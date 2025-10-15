/**
 * Server-side Authentication Module
 *
 * Provides secure session and JWT helpers for authentication.
 * NEVER trust client-supplied identity - always verify server-side.
 */

const crypto = require('crypto');

/**
 * Generate a cryptographically secure session secret
 * Run this once and store in environment variables
 */
function generateSessionSecret() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Get session configuration with secure defaults
 * @param {string} secret - Session secret from environment
 * @param {boolean} isProduction - Whether running in production
 * @returns {object} Session configuration
 */
function getSessionConfig(secret, isProduction = false) {
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters');
  }

  return {
    secret,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    name: 'titantech.sid', // Custom session name (security through obscurity)
    cookie: {
      httpOnly: true, // Prevent client-side JS access
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    },
    rolling: true, // Reset expiry on each request
  };
}

/**
 * Safely extract user identity from session
 * @param {object} req - Express request object
 * @returns {object|null} User object or null
 */
function getUserFromSession(req) {
  if (!req.session || !req.session.user) {
    return null;
  }

  // Return only safe, verified fields
  const { id, username, admin } = req.session.user;

  return {
    id: String(id),
    username: String(username),
    admin: Boolean(admin),
  };
}

/**
 * Check if user is authenticated
 * @param {object} req - Express request object
 * @returns {boolean}
 */
function isAuthenticated(req) {
  return getUserFromSession(req) !== null;
}

/**
 * Check if user is admin (server-side verification)
 * @param {object} req - Express request object
 * @returns {boolean}
 */
function isAdmin(req) {
  const user = getUserFromSession(req);
  return user !== null && user.admin === true;
}

/**
 * Create user session (call after successful login)
 * @param {object} req - Express request object
 * @param {object} user - User object from database
 */
function createUserSession(req, user) {
  // NEVER store sensitive data like passwords in session
  req.session.user = {
    id: user.id,
    username: user.username,
    admin: Boolean(user.admin),
  };

  // Regenerate session ID to prevent fixation attacks
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) {
        reject(err);
      } else {
        // Re-store user data after regeneration
        req.session.user = {
          id: user.id,
          username: user.username,
          admin: Boolean(user.admin),
        };
        resolve();
      }
    });
  });
}

/**
 * Destroy user session (call on logout)
 * @param {object} req - Express request object
 */
function destroyUserSession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean}
 */
function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const aLen = Buffer.byteLength(a);
  const bLen = Buffer.byteLength(b);

  // Make sure both buffers are the same length to prevent timing leaks
  const bufA = Buffer.alloc(Math.max(aLen, bLen), 0);
  const bufB = Buffer.alloc(Math.max(aLen, bLen), 0);

  bufA.write(a);
  bufB.write(b);

  return crypto.timingSafeEqual(bufA, bufB) && aLen === bLen;
}

module.exports = {
  generateSessionSecret,
  getSessionConfig,
  getUserFromSession,
  isAuthenticated,
  isAdmin,
  createUserSession,
  destroyUserSession,
  constantTimeCompare,
};
