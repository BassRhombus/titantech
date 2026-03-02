/**
 * File Upload Security Module
 *
 * Secure file upload configuration with validation, sanitization,
 * and protection against malicious files.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { sanitizeFilename, validateFileUpload } = require('./validation');

/**
 * Generate a secure random filename
 * @param {string} originalName - Original filename
 * @returns {string} Secure random filename with original extension
 */
function generateSecureFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const randomName = crypto.randomBytes(16).toString('hex');
  return `${randomName}${ext}`;
}

/**
 * Create secure multer storage configuration
 * @param {string} uploadDir - Directory to store uploads
 * @param {boolean} randomizeFilenames - Whether to randomize filenames (recommended)
 * @returns {object} Multer storage configuration
 */
function createSecureStorage(uploadDir, randomizeFilenames = true) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      if (randomizeFilenames) {
        // Generate secure random filename
        const secureFilename = generateSecureFilename(file.originalname);
        cb(null, secureFilename);
      } else {
        // Sanitize original filename
        const sanitized = sanitizeFilename(file.originalname);
        cb(null, `${Date.now()}_${sanitized}`);
      }
    },
  });
}

/**
 * Secure file filter for images
 * @param {object} req - Express request
 * @param {object} file - Multer file object
 * @param {Function} cb - Callback
 */
function imageFileFilter(req, file, cb) {
  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  // Allowed extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`), false);
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`Invalid file extension: ${ext}`), false);
  }

  // Check for path traversal in filename
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Invalid filename: path traversal detected'), false);
  }

  cb(null, true);
}

/**
 * Create secure image upload middleware
 * @param {object} options - Upload options
 * @returns {object} Configured multer instance
 */
function createImageUpload(options = {}) {
  const {
    uploadDir = path.join(__dirname, '../../uploads/images'),
    maxSize = 5 * 1024 * 1024, // 5MB default
    maxFiles = 1,
  } = options;

  return multer({
    storage: createSecureStorage(uploadDir, true),
    limits: {
      fileSize: maxSize,
      files: maxFiles,
      fields: 10, // Limit number of non-file fields
      parts: maxFiles + 10, // Total parts (files + fields)
    },
    fileFilter: imageFileFilter,
  });
}

/**
 * Secure showcase upload middleware
 */
function createShowcaseUpload() {
  const uploadDir = path.join(__dirname, '../../uploads/showcase');

  return multer({
    storage: createSecureStorage(uploadDir, true),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB for showcase images
      files: 1,
    },
    fileFilter: imageFileFilter,
  });
}

/**
 * Validate uploaded file content (not just MIME type)
 * This is a basic check - for production, consider using a library like file-type
 *
 * @param {string} filePath - Path to uploaded file
 * @returns {Promise<boolean>} Whether file is valid
 */
async function validateFileContent(filePath) {
  try {
    // Read first few bytes to check magic numbers
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    // Check magic numbers for common image formats
    const magicNumbers = {
      jpg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
      gif: [0x47, 0x49, 0x46],
      webp: [0x52, 0x49, 0x46, 0x46], // RIFF
    };

    // Check if file starts with any valid magic number
    for (const [format, magic] of Object.entries(magicNumbers)) {
      let isMatch = true;
      for (let i = 0; i < magic.length; i++) {
        if (buffer[i] !== magic[i]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        return true;
      }
    }

    console.warn(`File validation failed: Invalid magic number for file ${filePath}`);
    return false;
  } catch (error) {
    console.error('Error validating file content:', error);
    return false;
  }
}

/**
 * Middleware to validate file after upload
 * Use after multer middleware
 */
function validateUploadedFile(req, res, next) {
  if (!req.file) {
    return next();
  }

  validateFileContent(req.file.path)
    .then(isValid => {
      if (!isValid) {
        // Delete invalid file
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('Error deleting invalid file:', err);
        }

        return res.status(400).json({
          success: false,
          message: 'Invalid file content. File does not match its extension.',
        });
      }
      next();
    })
    .catch(error => {
      console.error('Error in file validation middleware:', error);
      next(error);
    });
}

/**
 * Clean up old uploaded files
 * Call periodically to remove files older than specified days
 *
 * @param {string} directory - Directory to clean
 * @param {number} daysOld - Delete files older than this many days
 */
function cleanupOldUploads(directory, daysOld = 30) {
  const now = Date.now();
  const maxAge = daysOld * 24 * 60 * 60 * 1000;

  try {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old upload: ${filePath}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old uploads:', error);
  }
}

/**
 * Delete a file safely
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<boolean>} Whether deletion was successful
 */
async function deleteFileSafely(filePath) {
  try {
    // Verify file is within uploads directory (prevent path traversal)
    const uploadsDir = path.join(__dirname, '../../uploads');
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(uploadsDir)) {
      console.error('Attempted to delete file outside uploads directory:', resolvedPath);
      return false;
    }

    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Secure server logo/banner upload middleware
 */
function createServerUpload() {
  const uploadDir = path.join(__dirname, '../../uploads/servers');

  return multer({
    storage: createSecureStorage(uploadDir, true),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB for server images
      files: 1,
    },
    fileFilter: imageFileFilter,
  });
}

module.exports = {
  generateSecureFilename,
  createSecureStorage,
  imageFileFilter,
  createImageUpload,
  createShowcaseUpload,
  createServerUpload,
  validateFileContent,
  validateUploadedFile,
  cleanupOldUploads,
  deleteFileSafely,
};
