/**
 * Input Validation Module
 *
 * Centralized validation schemas using Zod to prevent injection attacks
 * and ensure data integrity. ALL user inputs MUST be validated.
 */

const { z } = require('zod');

// Common reusable schemas
const schemas = {
  // Basic types with sanitization
  nonEmptyString: z.string().trim().min(1, 'Field cannot be empty'),
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid URL'),

  // Discord-specific
  discordUsername: z.string()
    .trim()
    .min(2, 'Discord username must be at least 2 characters')
    .max(32, 'Discord username cannot exceed 32 characters')
    .regex(/^.{2,32}#\d{4}$|^[^@#:]{2,32}$/, 'Invalid Discord username format'),

  // IDs and identifiers
  uuid: z.string().uuid('Invalid UUID'),
  objectId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid object ID'),

  // Numbers
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().min(0),

  // Enums
  commissionStatus: z.enum(['pending', 'in-progress', 'completed', 'rejected']),
  showcaseStatus: z.enum(['pending', 'approved', 'rejected']),
};

// Validation schemas for specific endpoints

/**
 * Commission submission validation
 */
const commissionSubmissionSchema = z.object({
  discordUsername: schemas.discordUsername,
  email: schemas.email.optional(),
  botType: z.string().trim().min(3, 'Bot type must be at least 3 characters').max(100),
  botDescription: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  budget: z.number().positive().optional(),
  timeframe: z.string().trim().min(1).max(100),
  tosAgreement: z.boolean().refine((val) => val === true, 'You must agree to the Terms of Service'),
});

/**
 * Commission status update validation
 */
const commissionStatusUpdateSchema = z.object({
  status: schemas.commissionStatus,
});

/**
 * Showcase submission validation
 */
const showcaseSubmissionSchema = z.object({
  imageTitle: z.string().trim().min(3, 'Title must be at least 3 characters').max(100),
  imageDescription: z.string().trim().max(500).optional(),
  authorName: z.string().trim().min(2, 'Author name must be at least 2 characters').max(50),
});

/**
 * Showcase status update validation
 */
const showcaseStatusUpdateSchema = z.object({
  status: schemas.showcaseStatus,
  reason: z.string().trim().max(500).optional(),
});

/**
 * Server submission validation
 */
const serverSubmissionSchema = z.object({
  name: z.string().trim().min(3, 'Server name must be at least 3 characters').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000),
  discordInvite: z.string().url('Invalid Discord invite URL').regex(/discord\.(gg|com\/invite)\//, 'Must be a valid Discord invite'),
  ownerDiscord: schemas.discordUsername,
  serverIP: z.string().trim().regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Must be a valid IPv4 address'),
  queryPort: z.coerce.number().int().min(1, 'Port must be between 1 and 65535').max(65535, 'Port must be between 1 and 65535'),
});

const serverStatusUpdateSchema = z.object({
  status: schemas.showcaseStatus,
  reason: z.string().trim().max(500).optional(),
});

/**
 * Webhook payload validation (Game.ini generation)
 */
const webhookGameIniSchema = z.object({
  fileType: z.string().trim().min(1),
  changedSettingsCount: schemas.nonNegativeInt,
  timestamp: z.string().datetime().or(z.number().positive()),
});

/**
 * Profile creation/update validation
 */
const profileSchema = z.object({
  name: z.string().trim().min(1, 'Profile name is required').max(50, 'Profile name cannot exceed 50 characters'),
  data: z.object({}).passthrough(), // Flexible to accept different generator data structures
});

/**
 * Profile update validation (all fields optional)
 */
const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  data: z.object({}).passthrough().optional(),
});

/**
 * Generator type validation
 */
const generatorTypeSchema = z.enum(['commands-ini', 'game-ini', 'rules-motd']);

/**
 * Generic validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from: 'body', 'query', 'params'
 * @returns {Function} Express middleware
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validated = schema.parse(data);

      // Replace the source data with validated data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      // Unexpected error
      console.error('Validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal validation error',
      });
    }
  };
}

/**
 * Sanitize HTML to prevent XSS
 * Basic implementation - for production, use DOMPurify or similar
 */
function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';

  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize filename to prevent path traversal
 */
function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return '';

  // Remove any directory traversal attempts
  const sanitized = filename
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  // Ensure it's not empty after sanitization
  return sanitized || 'file';
}

/**
 * Validate file upload
 */
function validateFileUpload(file, options = {}) {
  const {
    maxSize = 20 * 1024 * 1024, // 20MB default
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;

  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }

  // Check extension
  const ext = file.originalname.toLowerCase().match(/\.[^.]+$/);
  if (!ext || !allowedExtensions.includes(ext[0])) {
    errors.push('File extension is not allowed');
  }

  // Validate filename
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    errors.push('Invalid filename: contains path traversal characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  schemas,
  commissionSubmissionSchema,
  commissionStatusUpdateSchema,
  showcaseSubmissionSchema,
  showcaseStatusUpdateSchema,
  serverSubmissionSchema,
  serverStatusUpdateSchema,
  webhookGameIniSchema,
  profileSchema,
  profileUpdateSchema,
  generatorTypeSchema,
  validate,
  sanitizeHtml,
  sanitizeFilename,
  validateFileUpload,
};
