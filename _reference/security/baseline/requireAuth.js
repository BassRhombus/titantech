/**
 * Authentication Middleware Module
 *
 * Provides middleware functions to protect routes and verify permissions.
 * These MUST be used on all protected routes to prevent unauthorized access.
 */

const { getUserFromSession, isAuthenticated, isAdmin } = require('./serverAuth');
const { createErrorResponse } = require('./error');

/**
 * Middleware: Require authentication
 * Redirects to login page for browser requests, returns 401 for API requests
 */
function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    // Check if this is an API request
    if (req.path.startsWith('/api/')) {
      return res.status(401).json(
        createErrorResponse(
          'Authentication required',
          'UNAUTHORIZED',
          req.correlationId
        )
      );
    }

    // Browser request - redirect to login
    return res.redirect('/login.html');
  }

  // Attach user to request for easy access
  req.user = getUserFromSession(req);
  next();
}

/**
 * Middleware: Require admin privileges
 * Must be used AFTER requireAuth middleware
 */
function requireAdmin(req, res, next) {
  if (!isAdmin(req)) {
    // Check if this is an API request
    if (req.path.startsWith('/api/')) {
      return res.status(403).json(
        createErrorResponse(
          'Admin privileges required',
          'FORBIDDEN',
          req.correlationId
        )
      );
    }

    // Browser request - send 403 page or redirect
    return res.status(403).send('Access denied: Admin privileges required');
  }

  next();
}

/**
 * Middleware: Require ownership of resource
 * Verifies that the user owns the resource they're trying to access
 *
 * @param {Function} getResourceUserId - Function that extracts user ID from resource
 * @returns {Function} Middleware function
 *
 * Example usage:
 *   app.put('/api/commission/:id', requireAuth,
 *     requireOwnership((req) => getCommissionUserId(req.params.id)),
 *     updateCommission);
 */
function requireOwnership(getResourceUserId) {
  return async (req, res, next) => {
    try {
      const user = getUserFromSession(req);

      if (!user) {
        return res.status(401).json(
          createErrorResponse(
            'Authentication required',
            'UNAUTHORIZED',
            req.correlationId
          )
        );
      }

      // Admins can access all resources
      if (user.admin) {
        return next();
      }

      // Get the resource owner's user ID
      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        return res.status(404).json(
          createErrorResponse(
            'Resource not found',
            'NOT_FOUND',
            req.correlationId
          )
        );
      }

      // Verify ownership
      if (String(user.id) !== String(resourceUserId)) {
        return res.status(403).json(
          createErrorResponse(
            'You do not have permission to access this resource',
            'FORBIDDEN',
            req.correlationId
          )
        );
      }

      next();
    } catch (error) {
      console.error('Error checking resource ownership:', error);
      res.status(500).json(
        createErrorResponse(
          'Failed to verify resource ownership',
          'INTERNAL_ERROR',
          req.correlationId
        )
      );
    }
  };
}

/**
 * Middleware: Optional authentication
 * Attaches user to request if authenticated, but doesn't require it
 * Useful for endpoints that behave differently for authenticated users
 */
function optionalAuth(req, res, next) {
  if (isAuthenticated(req)) {
    req.user = getUserFromSession(req);
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireOwnership,
  optionalAuth,
};
