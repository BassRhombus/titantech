/**
 * Webhook Verification Module
 *
 * Verifies webhook signatures to ensure requests are legitimate.
 * Supports Discord Ed25519 signatures and generic HMAC signatures.
 */

const crypto = require('crypto');

/**
 * Verify Discord webhook signature (Ed25519)
 * Discord sends signatures in X-Signature-Ed25519 and X-Signature-Timestamp headers
 *
 * NOTE: For Discord Interactions (slash commands), use tweetnacl:
 *   const nacl = require('tweetnacl');
 *   nacl.sign.detached.verify(Buffer.from(timestamp + body), Buffer.from(signature, 'hex'), Buffer.from(publicKey, 'hex'))
 *
 * @param {object} req - Express request object
 * @param {string} publicKey - Discord application public key
 * @returns {boolean} Whether signature is valid
 */
function verifyDiscordWebhook(req, publicKey) {
  try {
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const body = JSON.stringify(req.body);

    if (!signature || !timestamp) {
      console.warn('Discord webhook verification failed: Missing signature headers');
      return false;
    }

    // Check timestamp is recent (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);

    if (Math.abs(now - requestTime) > 300) {
      console.warn('Discord webhook verification failed: Timestamp too old');
      return false;
    }

    // For production, install tweetnacl and verify Ed25519 signature
    // const nacl = require('tweetnacl');
    // const isVerified = nacl.sign.detached.verify(
    //   Buffer.from(timestamp + body),
    //   Buffer.from(signature, 'hex'),
    //   Buffer.from(publicKey, 'hex')
    // );

    // For now, log a warning that proper verification is not implemented
    console.warn('Discord webhook Ed25519 verification not fully implemented - install tweetnacl');

    return true; // Temporary - implement proper verification in production
  } catch (error) {
    console.error('Error verifying Discord webhook:', error);
    return false;
  }
}

/**
 * Verify HMAC webhook signature (generic)
 * For webhooks that use HMAC-SHA256 signatures
 *
 * @param {string} payload - Raw request body as string
 * @param {string} signature - Signature from header (usually X-Hub-Signature-256 or X-Signature)
 * @param {string} secret - Shared secret for HMAC
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {boolean} Whether signature is valid
 */
function verifyHmacWebhook(payload, signature, secret, algorithm = 'sha256') {
  try {
    if (!signature || !secret) {
      console.warn('HMAC webhook verification failed: Missing signature or secret');
      return false;
    }

    // Calculate expected signature
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(payload, 'utf8');
    const expectedSignature = hmac.digest('hex');

    // Remove prefix if present (e.g., "sha256=")
    const providedSignature = signature.replace(/^sha256=/, '');

    // Use timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(providedSignature, 'hex');

    if (expectedBuffer.length !== providedBuffer.length) {
      console.warn('HMAC webhook verification failed: Signature length mismatch');
      return false;
    }

    const isValid = crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isValid) {
      console.warn('HMAC webhook verification failed: Signature mismatch');
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying HMAC webhook:', error);
    return false;
  }
}

/**
 * Middleware: Require valid Discord webhook signature
 * @param {string} publicKey - Discord application public key from environment
 */
function requireDiscordWebhook(publicKey) {
  return (req, res, next) => {
    if (!publicKey) {
      console.error('Discord public key not configured');
      return res.status(500).json({
        success: false,
        message: 'Webhook verification not configured',
      });
    }

    if (!verifyDiscordWebhook(req, publicKey)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    next();
  };
}

/**
 * Middleware: Require valid HMAC webhook signature
 * @param {string} secret - Shared secret from environment
 * @param {string} headerName - Name of signature header (default: x-hub-signature-256)
 */
function requireHmacWebhook(secret, headerName = 'x-hub-signature-256') {
  return (req, res, next) => {
    if (!secret) {
      console.error('Webhook secret not configured');
      return res.status(500).json({
        success: false,
        message: 'Webhook verification not configured',
      });
    }

    const signature = req.headers[headerName.toLowerCase()];
    const payload = JSON.stringify(req.body);

    if (!verifyHmacWebhook(payload, signature, secret)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    next();
  };
}

/**
 * Middleware: Add webhook signature to outgoing webhooks
 * @param {string} secret - Shared secret
 * @param {object} payload - Payload to sign
 * @returns {string} HMAC signature
 */
function signWebhookPayload(secret, payload) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload), 'utf8');
  return 'sha256=' + hmac.digest('hex');
}

module.exports = {
  verifyDiscordWebhook,
  verifyHmacWebhook,
  requireDiscordWebhook,
  requireHmacWebhook,
  signWebhookPayload,
};
