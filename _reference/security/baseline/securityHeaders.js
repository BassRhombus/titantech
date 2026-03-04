/**
 * Security Headers Module
 *
 * Configures HTTP security headers using Helmet to prevent common web vulnerabilities
 * including XSS, clickjacking, MIME sniffing, and more.
 */

const helmet = require('helmet');

/**
 * Get Helmet configuration with secure defaults
 * @param {boolean} isProduction - Whether running in production
 * @returns {object} Helmet configuration
 */
function getHelmetConfig(isProduction = false) {
  return helmet({
    // Content Security Policy - prevents XSS and data injection attacks
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for inline scripts and onclick handlers
          "https://cdnjs.cloudflare.com",
          "https://pagead2.googlesyndication.com",
          "https://www.googletagservices.com",
          "https://adservice.google.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for inline styles
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "https://cdn.discordapp.com",
          "https://web-cdn.alderongames.com",
          "https://via.placeholder.com",
          "https://pagead2.googlesyndication.com",
        ],
        fontSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.gstatic.com",
        ],
        connectSrc: [
          "'self'",
          "https://pot-api.gsh-servers.com",
          "https://discord.com",
          "https://pagead2.googlesyndication.com",
          "https://*.adtrafficquality.google",
          "https://*.google.com",
        ],
        frameSrc: [
          "'self'",
          "https://open.spotify.com",
          "https://www.youtube.com",
          "https://youtube.com",
          "https://www.myinstants.com",
          "https://googleads.g.doubleclick.net",
          "https://pagead2.googlesyndication.com",
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: isProduction ? [] : null, // Upgrade HTTP to HTTPS in production
      },
    },

    // Strict-Transport-Security - forces HTTPS (production only)
    hsts: isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false,

    // X-Frame-Options - prevents clickjacking
    frameguard: {
      action: 'deny',
    },

    // X-Content-Type-Options - prevents MIME sniffing
    noSniff: true,

    // X-XSS-Protection - legacy XSS protection for older browsers
    xssFilter: true,

    // Referrer-Policy - controls referrer information
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false,
    },

    // IE No Open - prevents IE from executing downloads
    ieNoOpen: true,
  });
}

/**
 * Apply security headers middleware
 * @param {boolean} isProduction - Whether running in production
 * @returns {Function} Express middleware
 */
function applySecurityHeaders(isProduction = false) {
  return getHelmetConfig(isProduction);
}

/**
 * Additional custom security headers
 * Applied after Helmet for extra protection
 */
function additionalSecurityHeaders(req, res, next) {
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
  );

  // Cross-Origin-Embedder-Policy
  // Note: Not setting this header as it's too restrictive and breaks image loading
  // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  // Cross-Origin-Opener-Policy
  // Note: Not setting to 'same-origin' as it can break modal interactions
  // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin-Resource-Policy
  // Using 'cross-origin' instead of 'same-origin' to allow image loading
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  // X-Permitted-Cross-Domain-Policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  next();
}

/**
 * Correlation ID middleware - adds unique ID to each request for tracing
 */
function correlationId(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] ||
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  next();
}

module.exports = {
  getHelmetConfig,
  applySecurityHeaders,
  additionalSecurityHeaders,
  correlationId,
};
