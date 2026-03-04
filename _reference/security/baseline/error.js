/**
 * Error Handling Module
 *
 * Centralized error handling to prevent information disclosure
 * and provide consistent error responses with correlation IDs.
 */

/**
 * Create a standardized error response
 * @param {string} message - User-friendly error message
 * @param {string} code - Error code for client handling
 * @param {string} correlationId - Request correlation ID
 * @param {object} details - Additional error details (dev only)
 * @returns {object} Error response object
 */
function createErrorResponse(message, code = 'INTERNAL_ERROR', correlationId = null, details = null) {
  const response = {
    success: false,
    error: {
      message,
      code,
    },
  };

  if (correlationId) {
    response.error.correlationId = correlationId;
  }

  // Only include details in development
  if (details && process.env.NODE_ENV !== 'production') {
    response.error.details = details;
  }

  return response;
}

/**
 * Map common error types to user-friendly messages
 */
const errorMessages = {
  VALIDATION_ERROR: 'The provided data is invalid',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'The requested resource was not found',
  CONFLICT: 'The request conflicts with existing data',
  RATE_LIMIT: 'Too many requests, please try again later',
  INTERNAL_ERROR: 'An internal error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};

/**
 * Global error handler middleware
 * Should be added as the last middleware in Express app
 */
function globalErrorHandler(err, req, res, next) {
  // Log the error for debugging (with full stack trace)
  console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.path}`);
  console.error('Error:', err);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Determine error code and message
  let errorCode = err.code || 'INTERNAL_ERROR';
  let errorMessage = err.message || errorMessages[errorCode] || 'An unexpected error occurred';

  // Don't expose internal error messages in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    errorMessage = errorMessages.INTERNAL_ERROR;
    errorCode = 'INTERNAL_ERROR';
  }

  // Send error response
  res.status(statusCode).json(
    createErrorResponse(
      errorMessage,
      errorCode,
      req.correlationId,
      process.env.NODE_ENV !== 'production' ? {
        stack: err.stack,
        originalError: err.toString(),
      } : null
    )
  );
}

/**
 * 404 Not Found handler
 * Should be added before the global error handler
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch promise rejections
 *
 * Usage:
 *   app.get('/api/users', asyncHandler(async (req, res) => {
 *     const users = await getUsersFromDB();
 *     res.json(users);
 *   }));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create an error with specific status code and error code
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error classes for common scenarios
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT');
  }
}

/**
 * Safe error logger that doesn't log sensitive data
 */
function logError(error, context = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    correlationId: context.correlationId,
    path: context.path,
    method: context.method,
    userId: context.userId, // Only log user ID, not full user object
  };

  // In production, send to logging service (e.g., Sentry, CloudWatch)
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to external logging service
    // logger.error(logData);
    console.error(JSON.stringify(logData));
  } else {
    // In development, log full error with stack trace
    console.error('Error:', logData);
    console.error('Stack:', error.stack);
  }
}

module.exports = {
  createErrorResponse,
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  logError,
  errorMessages,
};
