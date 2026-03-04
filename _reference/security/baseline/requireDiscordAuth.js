/**
 * Discord Authentication Middleware Module
 *
 * Provides middleware functions specifically for Discord OAuth authentication.
 * Used to protect profile-related routes that require Discord login.
 */

const { createErrorResponse } = require('./error');

/**
 * Middleware: Require Discord authentication
 * Returns 401 for API requests if not authenticated via Discord OAuth
 */
function requireDiscordAuth(req, res, next) {
  // Check if user is authenticated via Discord (Passport.js sets req.user)
  if (!req.user || !req.user.id) {
    return res.status(401).json(
      createErrorResponse(
        'Discord authentication required. Please log in with Discord to use this feature.',
        'DISCORD_AUTH_REQUIRED',
        req.correlationId
      )
    );
  }

  // User is authenticated, proceed
  next();
}

/**
 * Middleware: Optional Discord authentication
 * Attaches Discord user to request if authenticated, but doesn't require it.
 * Useful for endpoints that behave differently for authenticated users.
 */
function optionalDiscordAuth(req, res, next) {
  // req.user is already set by Passport if authenticated
  // Just pass through regardless
  next();
}

/**
 * Helper function to check if user is Discord authenticated
 * Can be used in route handlers for conditional logic
 */
function isDiscordAuthenticated(req) {
  return !!(req.user && req.user.id);
}

/**
 * Helper function to get Discord user info from request
 * Returns null if not authenticated
 */
function getDiscordUser(req) {
  if (!req.user || !req.user.id) {
    return null;
  }

  return {
    id: req.user.id,
    username: req.user.username,
    discriminator: req.user.discriminator,
    avatar: req.user.avatar,
    isModerator: req.user.isModerator || false
  };
}

/**
 * Get Discord avatar URL
 * Returns default avatar if none set
 */
function getDiscordAvatarUrl(user) {
  if (!user || !user.id) {
    return null;
  }

  if (user.avatar) {
    const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}`;
  }

  // Default avatar based on discriminator or user ID
  const defaultIndex = user.discriminator
    ? parseInt(user.discriminator) % 5
    : (BigInt(user.id) >> 22n) % 6n;

  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}

module.exports = {
  requireDiscordAuth,
  optionalDiscordAuth,
  isDiscordAuthenticated,
  getDiscordUser,
  getDiscordAvatarUrl
};
