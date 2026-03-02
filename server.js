// =============================================================================
// TitanTech Server - Production-Grade Security Baseline
// =============================================================================

// Core dependencies
const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

// Load environment variables
require('dotenv').config();

// Security modules
const { getSessionConfig, createUserSession, destroyUserSession } = require('./security/baseline/serverAuth');
const { requireAuth, requireAdmin, optionalAuth } = require('./security/baseline/requireAuth');
const { validate, commissionSubmissionSchema, commissionStatusUpdateSchema, showcaseSubmissionSchema, showcaseStatusUpdateSchema, serverSubmissionSchema, serverStatusUpdateSchema, webhookGameIniSchema, profileSchema, profileUpdateSchema, generatorTypeSchema } = require('./security/baseline/validation');
const { requireDiscordAuth, getDiscordUser, getDiscordAvatarUrl } = require('./security/baseline/requireDiscordAuth');
const { loadUserProfiles, getProfile, createProfile, updateProfile, deleteProfile, getProfileCount, isValidGeneratorType, VALID_GENERATOR_TYPES, MAX_PROFILES_PER_TYPE } = require('./security/baseline/profileManager');
const { standardRateLimit, authRateLimit, uploadRateLimit, webhookRateLimit } = require('./security/baseline/rateLimit');
const { applySecurityHeaders, additionalSecurityHeaders, correlationId } = require('./security/baseline/securityHeaders');
const { applyCors, strictCors, publicCors } = require('./security/baseline/cors');
const { requireHmacWebhook } = require('./security/baseline/webhookVerify');
const { globalErrorHandler, notFoundHandler, asyncHandler } = require('./security/baseline/error');
const { createShowcaseUpload, createServerUpload, validateUploadedFile } = require('./security/baseline/uploads');

const app = express();

// Trust proxy - required for rate limiting when behind reverse proxy/load balancer
app.set('trust proxy', true);

// Environment configuration with validation
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT, 10) || 25011;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Validate critical environment variables
if (!SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable is not set!');
  console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

if (SESSION_SECRET.length < 32) {
  console.error('FATAL: SESSION_SECRET must be at least 32 characters long!');
  process.exit(1);
}

// Setup local JSON storage
const dataDir = path.join(__dirname, 'data');
const commissionsFile = path.join(dataDir, 'commissions.json');
const showcaseFile = path.join(dataDir, 'showcase.json');
const suggestionsFile = path.join(dataDir, 'suggestions.json');
const serversFile = path.join(dataDir, 'servers.json');

// Configuration from environment variables
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_SUGGESTIONS_WEBHOOK_URL = process.env.DISCORD_SUGGESTIONS_WEBHOOK_URL;
const DISCORD_ADMIN_TOKEN = process.env.DISCORD_ADMIN_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_CALLBACK_URL = process.env.DISCORD_CALLBACK_URL;
const DISCORD_MODERATORS = process.env.DISCORD_MODERATORS ? process.env.DISCORD_MODERATORS.split(',') : [];
const GSH_API_TOKEN = process.env.GSH_API_TOKEN;
const GSH_API_HOST = process.env.GSH_API_HOST || 'pot-api.gsh-servers.com';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';

// Create secure upload middleware
const upload = createShowcaseUpload();
const serverUpload = createServerUpload();

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory at ${dataDir}`);
}

// Initialize storage
let commissions = [];
let showcaseItems = [];
let suggestions = [];
let serverSubmissions = [];

// Load existing commissions from JSON file
function loadCommissions() {
  try {
    if (fs.existsSync(commissionsFile)) {
      const data = fs.readFileSync(commissionsFile, 'utf8');
      commissions = JSON.parse(data);
      console.log(`Loaded ${commissions.length} commissions from ${commissionsFile}`);
    } else {
      console.log(`No commissions file found at ${commissionsFile}, starting with empty array`);
      saveCommissions(); // Create the initial empty file
    }
  } catch (err) {
    console.error(`Error loading commissions from ${commissionsFile}:`, err);
    commissions = []; // Start with empty array in case of error
  }
}

// Load existing showcase items from JSON file
function loadShowcaseItems() {
  try {
    if (fs.existsSync(showcaseFile)) {
      const data = fs.readFileSync(showcaseFile, 'utf8');
      showcaseItems = JSON.parse(data);
      console.log(`Loaded ${showcaseItems.length} showcase items from ${showcaseFile}`);
    } else {
      console.log(`No showcase file found at ${showcaseFile}, starting with empty array`);
      saveShowcaseItems(); // Create the initial empty file
    }
  } catch (err) {
    console.error(`Error loading showcase items from ${showcaseFile}:`, err);
    showcaseItems = []; // Start with empty array in case of error
  }
}

// Save commissions to JSON file
function saveCommissions() {
  try {
    fs.writeFileSync(commissionsFile, JSON.stringify(commissions, null, 2), 'utf8');
    console.log(`Saved ${commissions.length} commissions to ${commissionsFile}`);
    return true;
  } catch (err) {
    console.error(`Error saving commissions to ${commissionsFile}:`, err);
    return false;
  }
}

// Save showcase items to JSON file
function saveShowcaseItems() {
  try {
    fs.writeFileSync(showcaseFile, JSON.stringify(showcaseItems, null, 2), 'utf8');
    console.log(`Saved ${showcaseItems.length} showcase items to ${showcaseFile}`);
    return true;
  } catch (err) {
    console.error(`Error saving showcase items to ${showcaseFile}:`, err);
    return false;
  }
}

// Load existing suggestions from JSON file
function loadSuggestions() {
  try {
    if (fs.existsSync(suggestionsFile)) {
      const data = fs.readFileSync(suggestionsFile, 'utf8');
      suggestions = JSON.parse(data);
      console.log(`Loaded ${suggestions.length} suggestions from ${suggestionsFile}`);
    } else {
      console.log(`No suggestions file found at ${suggestionsFile}, starting with empty array`);
      saveSuggestions(); // Create the initial empty file
    }
  } catch (err) {
    console.error(`Error loading suggestions from ${suggestionsFile}:`, err);
    suggestions = []; // Start with empty array in case of error
  }
}

// Save suggestions to JSON file
function saveSuggestions() {
  try {
    fs.writeFileSync(suggestionsFile, JSON.stringify(suggestions, null, 2), 'utf8');
    console.log(`Saved ${suggestions.length} suggestions to ${suggestionsFile}`);
    return true;
  } catch (err) {
    console.error(`Error saving suggestions to ${suggestionsFile}:`, err);
    return false;
  }
}

// Load server submissions from JSON file
function loadServerSubmissions() {
  try {
    if (fs.existsSync(serversFile)) {
      const data = fs.readFileSync(serversFile, 'utf8');
      serverSubmissions = JSON.parse(data);
      console.log(`Loaded ${serverSubmissions.length} server submissions from ${serversFile}`);
    } else {
      console.log(`No servers file found at ${serversFile}, starting with empty array`);
      saveServerSubmissions();
    }
  } catch (err) {
    console.error(`Error loading server submissions from ${serversFile}:`, err);
    serverSubmissions = [];
  }
}

// Save server submissions to JSON file
function saveServerSubmissions() {
  try {
    fs.writeFileSync(serversFile, JSON.stringify(serverSubmissions, null, 2), 'utf8');
    console.log(`Saved ${serverSubmissions.length} server submissions to ${serversFile}`);
    return true;
  } catch (err) {
    console.error(`Error saving server submissions to ${serversFile}:`, err);
    return false;
  }
}

// Generate a unique ID for commissions
function generateId() {
  return 'commission_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Load commissions, showcase items, suggestions, and server submissions at startup
loadCommissions();
loadShowcaseItems();
loadSuggestions();
loadServerSubmissions();

// Simple in-memory user store (replace with database in production)
// SECURITY NOTE: These are temporary users. In production, use a proper database with hashed passwords.
const users = [
  {
    id: '1',
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'CHANGE_ME_IMMEDIATELY',
    admin: true
  }
];

// Trust proxy for secure cookies when behind reverse proxy
if (isProduction || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
  console.log('Trust proxy enabled');
}

// =============================================================================
// SECURITY MIDDLEWARE - Apply these BEFORE route handlers
// =============================================================================

// 1. Correlation ID for request tracing
app.use(correlationId);

// 2. Security Headers (Helmet + custom headers)
app.use(applySecurityHeaders(isProduction));
app.use(additionalSecurityHeaders);

// 3. CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
app.use(applyCors(allowedOrigins, isDevelopment));

// 4. Configure secure session middleware
app.use(session(getSessionConfig(SESSION_SECRET, isProduction)));

// 4.5. Configure Passport for Discord OAuth
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Configure Discord Strategy
if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
  passport.use(new DiscordStrategy({
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: DISCORD_CALLBACK_URL,
    scope: ['identify']
  }, (accessToken, refreshToken, profile, done) => {
    // Check if user is a moderator
    const isModerator = DISCORD_MODERATORS.includes(profile.id);

    const user = {
      id: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
      isModerator: isModerator
    };

    return done(null, user);
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  console.log('Discord OAuth2 configured');
} else {
  console.log('Discord OAuth2 not configured - missing CLIENT_ID or CLIENT_SECRET');
}

// 5. Body parser middleware with size limits
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// 6. API request logging middleware (non-verbose in production)
app.use('/api/*', (req, res, next) => {
  if (isDevelopment || process.env.VERBOSE_LOGS === 'true') {
    console.log(`[${new Date().toISOString()}] [${req.correlationId}] ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT') {
      // Don't log sensitive data like passwords
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      console.log('Request body:', JSON.stringify(sanitizedBody));
    }
  }
  next();
});

// =============================================================================
// LEGACY MIDDLEWARE - Replaced by security baseline modules
// Keeping for reference, but new code should use requireAuth and requireAdmin
// =============================================================================

// Custom middleware for Discord webhook token authentication
function requireAdminOrToken(req, res, next) {
  // Check for token in query parameter
  const token = req.query.token;

  if (isDevelopment) {
    console.log('[Token Auth] Token provided:', token ? 'yes' : 'no');
    console.log('[Token Auth] DISCORD_ADMIN_TOKEN configured:', DISCORD_ADMIN_TOKEN ? 'yes' : 'no');
    console.log('[Token Auth] Token match:', token === DISCORD_ADMIN_TOKEN);
  }

  if (token && DISCORD_ADMIN_TOKEN && token === DISCORD_ADMIN_TOKEN) {
    // Valid token, proceed
    console.log('[Token Auth] Token validated successfully');
    return next();
  }

  // Fall back to session-based authentication
  console.log('[Token Auth] Falling back to session authentication');
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    requireAdmin(req, res, next);
  });
}

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// Basic login route - handle both /login and login paths
// Protected with rate limiting to prevent brute force attacks
app.post(['/login', 'login'], authRateLimit, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user (in production, this should query a database with hashed passwords)
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Create secure session
    await createUserSession(req, {
      id: user.id,
      username: user.username,
      admin: user.admin
    });

    console.log(`[${req.correlationId}] User logged in: ${username}`);
    res.redirect('dashboard.html');
  } else {
    console.warn(`[${req.correlationId}] Failed login attempt for username: ${username}`);
    res.redirect('login.html?error=1');
  }
}));

// Logout route - handle both /logout and logout paths
app.get(['/logout', 'logout'], asyncHandler(async (req, res) => {
  const username = req.session.user ? req.session.user.username : 'unknown';
  await destroyUserSession(req);
  req.logout(() => {
    console.log(`[${req.correlationId}] User logged out: ${username}`);
    res.redirect('/');
  });
}));

// =============================================================================
// DISCORD OAUTH ROUTES
// =============================================================================

// Discord login initiation
app.get('/auth/discord', passport.authenticate('discord'));

// Discord callback
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/suggestions.html?error=discord_auth_failed' }),
  async (req, res) => {
    // Create proper session with admin flag mapped from isModerator
    await createUserSession(req, {
      id: req.user.id,
      username: req.user.username,
      admin: req.user.isModerator || false
    });
    console.log(`[${req.correlationId}] Discord user logged in: ${req.user.username} (${req.user.id}), Admin: ${req.user.isModerator}`);
    res.redirect('/suggestions.html?auth=success');
  }
);

// Discord logout
app.get('/auth/discord/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/suggestions.html');
  });
});

// Get current Discord user info (enhanced with avatar URL)
app.get('/api/discord/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: {
        ...req.user,
        avatarUrl: getDiscordAvatarUrl(req.user)
      }
    });
  } else {
    res.json({
      success: false,
      user: null
    });
  }
});

// =============================================================================
// PROFILE API ROUTES - Discord-linked user profiles for INI generators
// =============================================================================

// List user's profiles for a specific generator type
app.get('/api/profiles/:generatorType', requireDiscordAuth, standardRateLimit, asyncHandler(async (req, res) => {
  const { generatorType } = req.params;
  const discordUserId = req.user.id;

  // Validate generator type
  if (!isValidGeneratorType(generatorType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid generator type. Must be one of: ${VALID_GENERATOR_TYPES.join(', ')}`
    });
  }

  const profiles = loadUserProfiles(discordUserId, generatorType);

  res.json({
    success: true,
    profiles: profiles,
    count: profiles.length,
    maxProfiles: MAX_PROFILES_PER_TYPE
  });
}));

// Get a specific profile
app.get('/api/profiles/:generatorType/:profileId', requireDiscordAuth, standardRateLimit, asyncHandler(async (req, res) => {
  const { generatorType, profileId } = req.params;
  const discordUserId = req.user.id;

  // Validate generator type
  if (!isValidGeneratorType(generatorType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid generator type. Must be one of: ${VALID_GENERATOR_TYPES.join(', ')}`
    });
  }

  const profile = getProfile(discordUserId, generatorType, profileId);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  res.json({
    success: true,
    profile: profile
  });
}));

// Create a new profile
app.post('/api/profiles/:generatorType', requireDiscordAuth, uploadRateLimit, validate(profileSchema), asyncHandler(async (req, res) => {
  const { generatorType } = req.params;
  const discordUserId = req.user.id;
  const { name, data } = req.body;

  // Validate generator type
  if (!isValidGeneratorType(generatorType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid generator type. Must be one of: ${VALID_GENERATOR_TYPES.join(', ')}`
    });
  }

  try {
    const profile = createProfile(discordUserId, generatorType, { name, data });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile: {
        id: profile.id,
        name: profile.name,
        generatorType: profile.generatorType,
        createdAt: profile.createdAt
      }
    });
  } catch (err) {
    // Check for specific errors
    if (err.message.includes('Maximum')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes('exceeds maximum size')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    throw err;
  }
}));

// Update an existing profile
app.put('/api/profiles/:generatorType/:profileId', requireDiscordAuth, uploadRateLimit, validate(profileUpdateSchema), asyncHandler(async (req, res) => {
  const { generatorType, profileId } = req.params;
  const discordUserId = req.user.id;
  const { name, data } = req.body;

  // Validate generator type
  if (!isValidGeneratorType(generatorType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid generator type. Must be one of: ${VALID_GENERATOR_TYPES.join(', ')}`
    });
  }

  try {
    const updatedProfile = updateProfile(discordUserId, generatorType, profileId, { name, data });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        generatorType: updatedProfile.generatorType,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (err) {
    if (err.message === 'Profile not found') {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    if (err.message.includes('exceeds maximum size')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    throw err;
  }
}));

// Delete a profile
app.delete('/api/profiles/:generatorType/:profileId', requireDiscordAuth, standardRateLimit, asyncHandler(async (req, res) => {
  const { generatorType, profileId } = req.params;
  const discordUserId = req.user.id;

  // Validate generator type
  if (!isValidGeneratorType(generatorType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid generator type. Must be one of: ${VALID_GENERATOR_TYPES.join(', ')}`
    });
  }

  try {
    deleteProfile(discordUserId, generatorType, profileId);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (err) {
    if (err.message === 'Profile not found') {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    throw err;
  }
}));

// =============================================================================
// API ROUTES
// =============================================================================

// User info endpoint - optionally authenticated
// IMPORTANT: This is protected against tampering because user info comes from server-side session
app.get('/api/user', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({
      loggedIn: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        admin: req.user.admin // This comes from SERVER session, not client!
      }
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
});

// Add a new endpoint to refresh mods data from API
app.get('/api/refresh-mods', async (req, res) => {
  try {
    const updateResult = await fetchModsFromAPI();
    res.json({ success: true, message: `Refreshed mods data. Found ${updateResult.count} mods.` });
  } catch (error) {
    console.error('Error refreshing mods data:', error);
    res.status(500).json({ success: false, message: 'Failed to refresh mods data', error: error.message });
  }
});

// Function to fetch mods from internal API and save them
async function fetchModsFromAPI() {
  return new Promise((resolve, reject) => {
    // Use internal API host - check for --dev flag
    let API_HOSTNAME;
    if (process.argv.includes('--dev')) {
      API_HOSTNAME = process.env.DEV_API_HOST || '172.93.102.240';
      console.log('Running in DEV mode');
    } else {
      API_HOSTNAME = process.env.INTERNAL_API_HOST || '848da576-521b-4606-a37f-cd7512c5a67e';
    }
    const API_PORT = parseInt(process.env.API_PORT, 10) || 25010;
    const API_PATH = '/api/mods';
    const JSON_FILE_PATH = path.join(__dirname, 'ModINI', 'public', 'mods_details.json');

    console.log(`[${new Date().toISOString()}] Fetching mods data from internal API host: ${API_HOSTNAME}:${API_PORT}`);

    const req = http.request({
      hostname: API_HOSTNAME,
      port: API_PORT,
      path: API_PATH,
      method: 'GET',
      timeout: 30000 // 30 seconds
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200 && data.length > 0) {
          try {
            const apiResponse = JSON.parse(data);

            // Support both array and object-with-mods formats
            const modsData = Array.isArray(apiResponse) ? apiResponse : apiResponse.mods;
            if (!Array.isArray(modsData)) {
              throw new Error('API response does not contain a mods array');
            }

            console.log(`Total mods received from internal API: ${modsData.length}`);
            console.log('First mod object from API:', JSON.stringify(modsData[0], null, 2));

            // Transform API data to our format using correct API field names
            const transformedMods = modsData.map(apiMod => ({
              sku: apiMod.sku,
              name: apiMod.name,
              description: apiMod.description || '',
              icon: apiMod.icon || '',
              creator: apiMod.creator || 'Unknown Creator'
            }));

            // Log any mods without SKU
            const modsWithoutSku = transformedMods.filter(mod => !mod.sku);
            if (modsWithoutSku.length > 0) {
              console.log(`Warning: ${modsWithoutSku.length} mods have no SKU:`, modsWithoutSku);
            }

            // Deduplicate by SKU (in case API has duplicates)
            const uniqueModsMap = new Map();
            transformedMods.forEach(mod => {
              if (mod.sku) {
                uniqueModsMap.set(mod.sku, mod);
              } else {
                console.log('Skipping mod without SKU:', mod);
              }
            });

            console.log(`Unique mods after deduplication: ${uniqueModsMap.size}`);

            // Convert back to array and sort alphabetically
            const sortedMods = Array.from(uniqueModsMap.values());
            sortedMods.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

            // Make sure directory exists
            const dirPath = path.dirname(JSON_FILE_PATH);
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }

            // Write the file
            fs.writeFile(JSON_FILE_PATH, JSON.stringify(sortedMods, null, 2), 'utf8', (err) => {
              if (err) {
                console.error(`Error writing mods data: ${err.message}`);
                reject(err);
                return;
              }
              console.log(`Updated mods data file with ${sortedMods.length} mods`);

              // Check if Pandora mod is present
              const pandora = sortedMods.find(m => m.sku && m.sku.includes('Y25EG85EVZ'));
              if (pandora) {
                console.log('✓ Pandora mod is present:', pandora.name);
              } else {
                console.log('✗ Pandora mod is missing from API response');
              }

              resolve({ count: sortedMods.length });
            });
          } catch (error) {
            console.error(`Error processing API response: ${error.message}`);
            reject(error);
          }
        } else {
          console.error(`API returned status code: ${res.statusCode}`);
          reject(new Error(`API request failed with status code: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`API request error: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`API request timed out`);
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.end();
  });
}

// Community server submission - with image upload and validation
app.post('/api/submit-server', uploadRateLimit, serverUpload.single('imageFile'), validateUploadedFile, validate(serverSubmissionSchema), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided. Please upload a server logo or banner.'
    });
  }

  const newServer = {
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description,
    imagePath: '/uploads/servers/' + req.file.filename,
    discordInvite: req.body.discordInvite,
    ownerDiscord: req.body.ownerDiscord,
    serverIP: req.body.serverIP,
    queryPort: parseInt(req.body.queryPort, 10),
    submittedAt: new Date(),
    status: 'pending',
    approvedAt: null
  };

  serverSubmissions.push(newServer);

  if (saveServerSubmissions()) {
    console.log(`[${req.correlationId}] Server submission saved: ${newServer.name} (${newServer.id})`);
    res.json({
      success: true,
      message: 'Your server has been submitted and is pending review by our team.'
    });
  } else {
    throw new Error('Failed to save server submission to disk');
  }
}));

// Public endpoint to get approved servers
app.get('/api/approved-servers', (req, res) => {
  const approved = serverSubmissions.filter(s => s.status === 'approved');
  res.json(approved);
});

// =============================================================================
// ADMIN API ROUTES - All require authentication AND admin privileges
// =============================================================================

// Admin endpoint to get pending server submissions
app.get('/api/admin/pending-servers', requireAuth, requireAdmin, (req, res) => {
  const pending = serverSubmissions.filter(s => s.status === 'pending');
  res.json(pending);
});

// Admin endpoint to get all server submissions
app.get('/api/admin/servers', requireAuth, requireAdmin, (req, res) => {
  res.json(serverSubmissions);
});

// Admin endpoint to update server submission status
app.put('/api/admin/servers/:id', requireAuth, requireAdmin, validate(serverStatusUpdateSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const index = serverSubmissions.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Server submission not found' });
  }

  serverSubmissions[index].status = status;

  if (reason) {
    serverSubmissions[index].rejectionReason = reason;
  }

  if (status === 'approved') {
    serverSubmissions[index].approvedAt = new Date();
  } else if (status === 'rejected') {
    serverSubmissions[index].rejectedAt = new Date();
  }

  if (saveServerSubmissions()) {
    res.json({ success: true, message: 'Server submission status updated', item: serverSubmissions[index] });
  } else {
    throw new Error('Failed to save updated server submission to disk');
  }
}));

// Admin endpoint to delete a server submission
app.delete('/api/admin/servers/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const index = serverSubmissions.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Server submission not found' });
  }

  const deleted = serverSubmissions.splice(index, 1)[0];

  // Try to delete the image file
  if (deleted.imagePath) {
    const fullPath = path.join(__dirname, deleted.imagePath);
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error('Error deleting server image:', err);
    }
  }

  if (saveServerSubmissions()) {
    res.json({ success: true, message: 'Server submission deleted' });
  } else {
    throw new Error('Failed to save after deleting server submission');
  }
}));

// Commission form endpoint - with rate limiting and validation
app.post('/api/commission', uploadRateLimit, validate(commissionSubmissionSchema), asyncHandler(async (req, res) => {
  // Log the commission request data
  console.log(`[${req.correlationId}] New commission request received`);

  // Create a new commission
  const timestamp = new Date();
  const newCommission = {
    id: generateId(),
    discordUsername: req.body.discordUsername,
    email: req.body.email || '',
    botType: req.body.botType,
    botDescription: req.body.botDescription,
    budget: req.body.budget ? Number(req.body.budget) : undefined,
    timeframe: req.body.timeframe,
    tosAgreement: req.body.tosAgreement,
    submittedAt: timestamp,
    status: 'pending'
  };

  // Add to commissions array
  commissions.push(newCommission);

  // Save to JSON file
  if (saveCommissions()) {
    res.json({
      success: true,
      message: 'Commission request received successfully'
    });
  } else {
    throw new Error('Failed to save commission to disk');
  }
}));

// Add an admin endpoint to view commission requests
app.get('/api/admin/commissions', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  console.log(`[${req.correlationId}] Admin ${req.user.username} fetching commissions`);
  res.json(commissions);
}));

// Add an endpoint to update commission status - with validation
app.put('/api/admin/commissions/:id', requireAuth, requireAdmin, validate(commissionStatusUpdateSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`[${req.correlationId}] Admin ${req.user.username} updating commission ${id} to status: ${status}`);

  // Find the commission by id - handle both direct match and MongoDB ObjectId string formats
  let index = commissions.findIndex(c => c.id === id);
    
    // If not found, try matching just the timestamp part of the ID (for backward compatibility)
    if (index === -1 && id.includes('_')) {
      const idParts = id.split('_');
      if (idParts.length >= 2) {
        const timestampPart = idParts[1];
        index = commissions.findIndex(c => 
          c.id && c.id.includes(timestampPart)
        );
        console.log(`Tried matching by timestamp part: ${timestampPart}, found at index: ${index}`);
      }
    }
    
    console.log(`Looking for commission with ID: ${id}, found at index: ${index}`);
    
    if (index === -1) {
      // Try to reload commissions from disk in case they were updated elsewhere
      try {
        loadCommissions();
        
        // Try direct match again after reload
        index = commissions.findIndex(c => c.id === id);
        
        // If still not found, try the timestamp part matching again
        if (index === -1 && id.includes('_')) {
          const idParts = id.split('_');
          if (idParts.length >= 2) {
            const timestampPart = idParts[1];
            index = commissions.findIndex(c => 
              c.id && c.id.includes(timestampPart)
            );
            console.log(`After reload, tried matching by timestamp part: ${timestampPart}, found at index: ${index}`);
          }
        }
        
        if (index === -1) {
          return res.status(404).json({
            success: false,
            message: 'Commission request not found'
          });
        } else {
          console.log(`Found commission after reload at index: ${index}`);
          // Continue with the found index
          commissions[index].status = status;
          
          if (saveCommissions()) {
            return res.json({
              success: true,
              message: 'Commission status updated after reload',
              commission: commissions[index]
            });
          } else {
            throw new Error('Failed to save updated commission to disk after reload');
          }
        }
      } catch (reloadError) {
        console.error('Error reloading commissions:', reloadError);
        return res.status(404).json({
          success: false,
          message: 'Commission request not found and reload failed'
        });
      }
    }
    
    // Update the status
    commissions[index].status = status;
    
    // Save to JSON file
    if (saveCommissions()) {
      return res.json({
        success: true,
        message: 'Commission status updated',
        commission: commissions[index]
      });
    } else {
      throw new Error('Failed to save updated commission to disk');
    }
}));

// Add an endpoint to upload showcase items (deprecated - use /api/showcase/submit)
app.post('/api/showcase', requireAuth, upload.single('image'), validateUploadedFile, asyncHandler(async (req, res) => {
  const newShowcaseItem = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description,
    imagePath: req.file.path,
    uploadedAt: new Date()
  };

  showcaseItems.push(newShowcaseItem);

  if (saveShowcaseItems()) {
    res.json({
      success: true,
      message: 'Showcase item uploaded successfully',
      item: newShowcaseItem
    });
  } else {
    throw new Error('Failed to save showcase item to disk');
  }
}));

// Showcase API endpoints

// Public endpoint to get approved showcase items
app.get('/api/showcase', (req, res) => {
  try {
    // Only return approved items for public view
    const approvedItems = showcaseItems.filter(item => item.status === 'approved');
    res.json(approvedItems);
  } catch (error) {
    console.error('Error fetching showcase items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showcase items',
      error: error.message
    });
  }
});

// Endpoint to submit a new showcase item - with rate limiting and validation
app.post('/api/showcase/submit', uploadRateLimit, upload.single('imageFile'), validateUploadedFile, validate(showcaseSubmissionSchema), asyncHandler(async (req, res) => {
  // Validate required fields
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  if (!req.body.imageTitle || !req.body.authorName) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  // Create a new showcase item
  const timestamp = new Date();
  const newShowcaseItem = {
    id: uuidv4(),
    imageTitle: req.body.imageTitle,
    imageDescription: req.body.imageDescription || '',
    imagePath: '/uploads/showcase/' + req.file.filename, // Store path relative to public directory
    authorName: req.body.authorName,
    submittedAt: timestamp,
    status: 'pending', // All submissions start with pending status
    likes: 0
  };

  // Add to showcase items array
  showcaseItems.push(newShowcaseItem);

  // Save to JSON file
  if (saveShowcaseItems()) {
    res.json({
      success: true,
      message: 'Your submission has been received and is pending approval by our team.'
    });
  } else {
    throw new Error('Failed to save showcase item to disk');
  }
}));

// Admin endpoint to get all showcase items (for management)
app.get('/api/admin/showcase', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  res.json(showcaseItems);
}));

// Admin endpoint to update showcase item status - with validation
app.put('/api/admin/showcase/:id', requireAuth, requireAdmin, validate(showcaseStatusUpdateSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  // Find the item by id
  const index = showcaseItems.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Showcase item not found'
    });
  }

  // Update the status
  showcaseItems[index].status = status;

  // Add reason if provided (for rejections)
  if (reason) {
    showcaseItems[index].rejectionReason = reason;
  }

  // Add timestamp for the status change
  if (status === 'approved') {
    showcaseItems[index].approvedAt = new Date();
  } else if (status === 'rejected') {
    showcaseItems[index].rejectedAt = new Date();
  }

  // Save to JSON file
  if (saveShowcaseItems()) {
    return res.json({
      success: true,
      message: 'Showcase item status updated',
      item: showcaseItems[index]
    });
  } else {
    throw new Error('Failed to save updated showcase item to disk');
  }
}));

// Admin endpoint to delete a showcase item
app.delete('/api/admin/showcase/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the item by id
  const index = showcaseItems.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Showcase item not found'
    });
  }

  // Get the image path for deletion
  const imagePath = showcaseItems[index].imagePath;

  // Remove from array
  showcaseItems.splice(index, 1);

  // Save to JSON file
  if (saveShowcaseItems()) {
    // Try to delete the image file (but don't fail if we can't)
    if (imagePath) {
      const fullImagePath = path.join(__dirname, imagePath);
      if (fs.existsSync(fullImagePath)) {
        try {
          fs.unlinkSync(fullImagePath);
          console.log(`Deleted showcase image file: ${fullImagePath}`);
        } catch (err) {
          console.error(`Warning: Could not delete showcase image file ${fullImagePath}:`, err);
        }
      }
    }

    return res.json({
      success: true,
      message: 'Showcase item deleted successfully'
    });
  } else {
    throw new Error('Failed to save showcase items to disk after deletion');
  }
}));

// =============================================================================
// PROTECTED HTML ROUTES - Require authentication
// =============================================================================

// Admin route for showcase management page - REMOVED

// Set up automatic refresh of mods data every 5 minutes
setInterval(async () => {
  try {
    console.log("Automatic refresh of mods data triggered");
    await fetchModsFromAPI();
  } catch (error) {
    console.error('Error during automatic mods refresh:', error);
  }
}, 5 * 60 * 1000); // 5 minutes

// Initial fetch on server start
fetchModsFromAPI().catch(error => {
  console.error('Error during initial mods fetch:', error);
});

// =============================================================================
// Suggestions API Endpoints
// =============================================================================

// Comment rate limiter storage (IP -> timestamp of last comment)
const commentRateLimiter = new Map();

// Check if user can post a comment (30 second cooldown)
function canPostComment(identifier) {
  const now = Date.now();
  const lastCommentTime = commentRateLimiter.get(identifier);

  if (!lastCommentTime) {
    return true;
  }

  const timeSinceLastComment = now - lastCommentTime;
  return timeSinceLastComment >= 30000; // 30 seconds
}

// Update comment timestamp
function updateCommentTime(identifier) {
  commentRateLimiter.set(identifier, Date.now());
}

// Get remaining cooldown in seconds
function getRemainingCooldown(identifier) {
  const now = Date.now();
  const lastCommentTime = commentRateLimiter.get(identifier);

  if (!lastCommentTime) {
    return 0;
  }

  const timeSinceLastComment = now - lastCommentTime;
  const remainingMs = 30000 - timeSinceLastComment;

  return Math.max(0, Math.ceil(remainingMs / 1000));
}

// =============================================================================
// Suggestions API Endpoints
// =============================================================================

// Get all suggestions
app.get('/api/suggestions', (req, res) => {
  try {
    // Return all suggestions sorted by date (newest first)
    const sortedSuggestions = [...suggestions].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(sortedSuggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Submit a new suggestion
app.post('/api/suggestions', uploadRateLimit, asyncHandler(async (req, res) => {
  const { title, category, description, author } = req.body;

  // Validate required fields
  if (!title || !category || !description) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, category, and description are required'
    });
  }

  // Validate title length
  if (title.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Title must be 100 characters or less'
    });
  }

  // Validate description length
  if (description.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Description must be 1000 characters or less'
    });
  }

  // Validate category
  const validCategories = ['features', 'map-changes', 'bugs', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category'
    });
  }

  // Create new suggestion
  const newSuggestion = {
    id: uuidv4(),
    title: title.trim(),
    category,
    description: description.trim(),
    author: author ? author.trim() : 'Anonymous',
    votes: 0,
    createdAt: new Date().toISOString()
  };

  // Add to suggestions array
  suggestions.push(newSuggestion);

  // Save to file
  if (!saveSuggestions()) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save suggestion'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Suggestion submitted successfully',
    suggestion: newSuggestion
  });
}));

// Vote on a suggestion
app.post('/api/suggestions/:id/vote', standardRateLimit, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the suggestion
  const suggestion = suggestions.find(s => s.id === id);

  if (!suggestion) {
    return res.status(404).json({
      success: false,
      message: 'Suggestion not found'
    });
  }

  // Increment votes
  suggestion.votes = (suggestion.votes || 0) + 1;

  // Save to file
  if (!saveSuggestions()) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save vote'
    });
  }

  res.json({
    success: true,
    message: 'Vote recorded',
    votes: suggestion.votes
  });
}));

// Add a comment to a suggestion
app.post('/api/suggestions/:id/comments', uploadRateLimit, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, author } = req.body;

  // Rate limiting check (30 seconds per IP)
  const userIdentifier = req.ip || req.connection.remoteAddress;

  if (!canPostComment(userIdentifier)) {
    const remainingSeconds = getRemainingCooldown(userIdentifier);
    return res.status(429).json({
      success: false,
      message: `Please wait ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} before posting another comment`,
      cooldown: remainingSeconds
    });
  }

  // Validate required fields
  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Comment text is required'
    });
  }

  // Validate comment length
  if (text.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Comment must be 500 characters or less'
    });
  }

  // Find the suggestion
  const suggestion = suggestions.find(s => s.id === id);

  if (!suggestion) {
    return res.status(404).json({
      success: false,
      message: 'Suggestion not found'
    });
  }

  // Initialize comments array if it doesn't exist
  if (!suggestion.comments) {
    suggestion.comments = [];
  }

  // Create new comment
  const newComment = {
    id: uuidv4(),
    text: text.trim(),
    author: author ? author.trim() : 'Anonymous',
    likes: 0,
    createdAt: new Date().toISOString()
  };

  // Add comment to suggestion
  suggestion.comments.push(newComment);

  // Save to file
  if (!saveSuggestions()) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save comment'
    });
  }

  // Update rate limiter
  updateCommentTime(userIdentifier);

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    comment: newComment
  });
}));

// Like a comment
app.post('/api/suggestions/:suggestionId/comments/:commentId/like', standardRateLimit, asyncHandler(async (req, res) => {
  const { suggestionId, commentId } = req.params;

  // Find the suggestion
  const suggestion = suggestions.find(s => s.id === suggestionId);

  if (!suggestion) {
    return res.status(404).json({
      success: false,
      message: 'Suggestion not found'
    });
  }

  // Find the comment
  const comment = suggestion.comments?.find(c => c.id === commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Increment likes
  comment.likes = (comment.likes || 0) + 1;

  // Save to file
  if (!saveSuggestions()) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save like'
    });
  }

  res.json({
    success: true,
    message: 'Like recorded',
    likes: comment.likes
  });
}));

// =============================================================================
// Moderator Delete Endpoints (Discord OAuth)
// =============================================================================

// Middleware to check if user is a Discord moderator
function requireModerator(req, res, next) {
  if (!req.user || !req.user.isModerator) {
    return res.status(403).json({
      success: false,
      message: 'Moderator access required'
    });
  }
  next();
}

// Delete a suggestion (moderators only)
app.delete('/api/suggestions/:id', requireModerator, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const index = suggestions.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Suggestion not found'
    });
  }

  suggestions.splice(index, 1);

  if (!saveSuggestions()) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete suggestion'
    });
  }

  console.log(`[Moderator ${req.user.username}] Deleted suggestion ${id}`);

  res.json({
    success: true,
    message: 'Suggestion deleted successfully'
  });
}));

// Delete a comment (moderators only)
app.delete('/api/suggestions/:suggestionId/comments/:commentId', requireModerator, asyncHandler(async (req, res) => {
  const { suggestionId, commentId } = req.params;

  const suggestion = suggestions.find(s => s.id === suggestionId);

  if (!suggestion) {
    return res.status(404).json({
      success: false,
      message: 'Suggestion not found'
    });
  }

  if (!suggestion.comments) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  const commentIndex = suggestion.comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  suggestion.comments.splice(commentIndex, 1);

  if (!saveSuggestions()) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }

  console.log(`[Moderator ${req.user.username}] Deleted comment ${commentId} from suggestion ${suggestionId}`);

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
}));

// Serve static files
app.use(express.static(__dirname));

// Special route for mods data
app.get('/ModINI/public/mods_details.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'ModINI/public/mods_details.json'));
});

// Special route for mod-manager (separate from main site)
app.use('/mod-manager', express.static(path.join(__dirname, 'ModINI/public')));

// Login page route
app.get('/login.html', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session.user) {
    return res.redirect('/dashboard.html');
  }
  // Otherwise serve the login page
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Protected routes
app.get('/dashboard.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Admin routes removed

// Cache for servers and mods
let serversCache = { data: null, timestamp: 0 };
let modsCache = { data: null, timestamp: 0 };
let curveOverridesCache = { data: null, timestamp: 0 };
const SERVERS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const MODS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CURVE_OVERRIDES_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper function to make HTTPS requests
function makeHttpsRequest(options) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const apiReq = https.request(options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        if (apiRes.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Failed to parse JSON response'));
          }
        } else {
          reject(new Error(`API returned status ${apiRes.statusCode}`));
        }
      });
    });

    apiReq.on('error', (error) => {
      reject(error);
    });

    apiReq.end();
  });
}

// Fetch and cache all mods
async function fetchAndCacheMods() {
  const now = Date.now();

  // Return cached data if still valid
  if (modsCache.data && (now - modsCache.timestamp) < MODS_CACHE_DURATION) {
    console.log('Returning cached mods data');
    return modsCache.data;
  }

  console.log('Fetching fresh mods data from API (with pagination)');

  try {
    // Fetch all mods using offset/limit pagination
    let allMods = [];
    let offset = 0;
    const limit = 100;
    let total = 0;

    do {
      const options = {
        hostname: 'pot-api.gsh-servers.com',
        path: `/api/v1/mods?offset=${offset}&limit=${limit}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GSH_API_TOKEN}`,
          'Accept': 'application/json'
        }
      };

      const data = await makeHttpsRequest(options);

      if (data.total) {
        total = data.total;
      }

      if (data.items && Array.isArray(data.items)) {
        allMods = allMods.concat(data.items);
        console.log(`Fetched mods at offset ${offset}, got ${data.items.length} mods, total so far: ${allMods.length}/${total}`);

        // If we got fewer items than the limit, we've reached the end
        if (data.items.length < limit) {
          break;
        }
      } else {
        break;
      }

      offset += limit;
    } while (allMods.length < total);

    // Create a lookup map by mod ID
    const modsMap = {};
    allMods.forEach(mod => {
      if (mod.id) {
        // Store both numeric and string versions of the ID
        modsMap[mod.id] = mod.name || `Mod ${mod.id}`;
        modsMap[String(mod.id)] = mod.name || `Mod ${mod.id}`;
      }
    });

    modsCache = {
      data: modsMap,
      timestamp: now
    };

    console.log(`Successfully cached ${Object.keys(modsMap).length / 2} unique mods out of ${total} total`);
    return modsMap;
  } catch (error) {
    console.error('Error fetching mods:', error);
    // Return existing cache if available, even if expired
    return modsCache.data || {};
  }
}

// Fetch and cache servers (with pagination support)
async function fetchAndCacheServers() {
  const now = Date.now();

  // Return cached data if still valid
  if (serversCache.data && (now - serversCache.timestamp) < SERVERS_CACHE_DURATION) {
    console.log('Returning cached servers data');
    return serversCache.data;
  }

  console.log('Fetching fresh servers data from API (with pagination)');

  try {
    // Fetch all servers using offset/limit pagination
    let allServers = [];
    let offset = 0;
    const limit = 100;
    let total = 0;

    do {
      const options = {
        hostname: 'pot-api.gsh-servers.com',
        path: `/api/v1/servers?offset=${offset}&limit=${limit}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GSH_API_TOKEN}`,
          'Accept': 'application/json'
        }
      };

      const data = await makeHttpsRequest(options);

      if (data.total) {
        total = data.total;
      }

      if (data.items && Array.isArray(data.items)) {
        allServers = allServers.concat(data.items);
        console.log(`Fetched servers at offset ${offset}, got ${data.items.length} servers, total so far: ${allServers.length}/${total}`);

        // If we got fewer items than the limit, we've reached the end
        if (data.items.length < limit) {
          break;
        }
      } else {
        break;
      }

      offset += limit;
    } while (allServers.length < total);

    const fullData = {
      total: total,
      items: allServers
    };

    serversCache = {
      data: fullData,
      timestamp: now
    };

    console.log(`Successfully cached ${allServers.length} servers out of ${total} total`);
    return fullData;
  } catch (error) {
    console.error('Error fetching servers:', error);
    // Return existing cache if available, even if expired
    return serversCache.data || { total: 0, items: [] };
  }
}

// Fetch and cache curve overrides categories
async function fetchAndCacheCurveOverrides() {
  const now = Date.now();

  // Return cached data if still valid
  if (curveOverridesCache.data && (now - curveOverridesCache.timestamp) < CURVE_OVERRIDES_CACHE_DURATION) {
    console.log('Returning cached curve overrides categories data');
    return curveOverridesCache.data;
  }

  console.log('Fetching fresh curve overrides categories data from API');

  try {
    const options = {
      hostname: 'pot-api.gsh-servers.com',
      path: `/api/v1/co`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GSH_API_TOKEN}`,
        'Accept': 'application/json'
      }
    };

    const data = await makeHttpsRequest(options);

    curveOverridesCache = {
      data: data,
      timestamp: now
    };

    console.log(`Successfully cached curve overrides categories:`, data.categories);
    return data;
  } catch (error) {
    console.error('Error fetching curve overrides categories:', error);
    // Return existing cache if available, even if expired
    return curveOverridesCache.data || { categories: [] };
  }
}

// GSH servers endpoint
app.get('/api/gsh-servers', (req, res) => {
  try {
    const serversFilePath = path.join(__dirname, 'servers.txt');
    if (fs.existsSync(serversFilePath)) {
      const data = fs.readFileSync(serversFilePath, 'utf8');
      const ips = data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      res.json({ ips });
    } else {
      res.json({ ips: [] });
    }
  } catch (error) {
    console.error('Error reading GSH servers file:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Community servers API endpoint with caching
app.get('/api/community-servers', async (req, res) => {
  try {
    const data = await fetchAndCacheServers();
    res.json(data);
  } catch (error) {
    console.error('Error in community servers endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all mods endpoint with caching
app.get('/api/community-mods', async (req, res) => {
  try {
    const modsMap = await fetchAndCacheMods();
    res.json(modsMap);
  } catch (error) {
    console.error('Error in community mods endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get curve overrides categories endpoint with caching
app.get('/api/v1/co', async (req, res) => {
  try {
    const data = await fetchAndCacheCurveOverrides();
    res.json(data);
  } catch (error) {
    console.error('Error in curve overrides categories endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get curve overrides for specific category (creatures list)
app.get('/api/v1/co/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const options = {
      hostname: 'pot-api.gsh-servers.com',
      path: `/api/v1/co/${category}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GSH_API_TOKEN}`,
        'Accept': 'application/json'
      }
    };

    const data = await makeHttpsRequest(options);
    res.json(data);
  } catch (error) {
    console.error(`Error in curve overrides endpoint for category ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all curve overrides for specific category/creature (all sections)
// This handles both 2-param (category/creature) and 3-param (category/author/creature) patterns
app.get('/api/v1/co/:category/:param2/:param3?', async (req, res) => {
  try {
    const { category, param2, param3 } = req.params;

    // Determine if this is a 2-param or 3-param request
    let apiPath;
    if (param3) {
      // 3 params: category/author/creature (for Mod category)
      apiPath = `/api/v1/co/${category}/${param2}/${param3}`;
    } else {
      // 2 params: category/creature (for Alderon/Critters categories)
      apiPath = `/api/v1/co/${category}/${param2}`;
    }

    const options = {
      hostname: 'pot-api.gsh-servers.com',
      path: apiPath,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GSH_API_TOKEN}`,
        'Accept': 'application/json'
      }
    };

    const data = await makeHttpsRequest(options);
    res.json(data);
  } catch (error) {
    console.error(`Error in curve overrides endpoint:`, error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Pre-cache mods on server startup
fetchAndCacheMods().then(() => {
  console.log('Initial mods cache loaded');
}).catch(error => {
  console.error('Failed to load initial mods cache:', error);
});

// Pre-cache curve overrides on server startup
fetchAndCacheCurveOverrides().then(() => {
  console.log('Initial curve overrides cache loaded');
}).catch(error => {
  console.error('Failed to load initial curve overrides cache:', error);
});

// Discord webhook endpoint for Game.ini generation notifications
// With rate limiting and optional validation
app.post('/api/webhook/game-ini-generated', webhookRateLimit, validate(webhookGameIniSchema), asyncHandler(async (req, res) => {
  // Skip if no webhook URL is configured
  if (!DISCORD_WEBHOOK_URL) {
    console.log('No Discord webhook URL configured, skipping notification');
    return res.json({ success: true, message: 'No webhook configured' });
  }

    const { fileType, changedSettingsCount, timestamp } = req.body;

    // Determine color based on file type
    let embedColor;
    if (fileType === 'Game.ini') {
      embedColor = 0x00CFFF; // Blue
    } else if (fileType === 'Commands.ini') {
      embedColor = 0xD94FCB; // Pink
    } else if (fileType === 'Rules.txt') {
      embedColor = 0x4CAF50; // Green
    } else if (fileType === 'MOTD.txt') {
      embedColor = 0xFF9800; // Orange
    } else {
      embedColor = 0x00CFFF; // Default blue
    }

    // Determine generator name
    let generatorName;
    if (fileType.includes('Game.ini')) {
      generatorName = 'Game.ini Generator';
    } else if (fileType.includes('Commands.ini')) {
      generatorName = 'Commands.ini Generator';
    } else if (fileType.includes('Rules.txt')) {
      generatorName = 'Rules/MOTD Generator (Rules)';
    } else if (fileType.includes('MOTD.txt')) {
      generatorName = 'Rules/MOTD Generator (MOTD)';
    } else {
      generatorName = 'TitanTech Generator';
    }

    // Create Discord embed
    const embed = {
      title: `${fileType} Generated`,
      description: `A user has generated a ${fileType} file using the TitanTech generator.`,
      color: embedColor,
      fields: [
        {
          name: fileType.includes('.txt') ? '📝 Lines' : '📊 Settings Changed',
          value: fileType.includes('.txt') ? `${changedSettingsCount} lines` : `${changedSettingsCount} setting(s) modified`,
          inline: true
        },
        {
          name: '⏰ Generated At',
          value: new Date(timestamp).toLocaleString(),
          inline: true
        },
        {
          name: '🔧 Generator',
          value: generatorName,
          inline: false
        }
      ],
      footer: {
        text: 'TitanTech'
      },
      timestamp: new Date(timestamp).toISOString()
    };

    // Send to Discord
    const https = require('https');
    const url = new URL(DISCORD_WEBHOOK_URL);

    const postData = JSON.stringify({
      embeds: [embed]
    });

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const webhookReq = https.request(options, (webhookRes) => {
      let data = '';

      webhookRes.on('data', (chunk) => {
        data += chunk;
      });

      webhookRes.on('end', () => {
        if (webhookRes.statusCode === 204 || webhookRes.statusCode === 200) {
          console.log('Discord webhook sent successfully');
          res.json({ success: true, message: 'Webhook sent successfully' });
        } else {
          console.error(`Discord webhook failed with status ${webhookRes.statusCode}`);
          res.status(500).json({ success: false, message: 'Webhook failed' });
        }
      });
    });

    webhookReq.on('error', (error) => {
      console.error('Error sending Discord webhook:', error);
      res.status(500).json({ success: false, message: 'Webhook error', error: error.message });
    });

  webhookReq.write(postData);
  webhookReq.end();
}));

// Auto-refresh caches periodically
setInterval(() => {
  fetchAndCacheServers().catch(error => {
    console.error('Error refreshing servers cache:', error);
  });
}, SERVERS_CACHE_DURATION);

setInterval(() => {
  fetchAndCacheMods().catch(error => {
    console.error('Error refreshing mods cache:', error);
  });
}, MODS_CACHE_DURATION);

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all for other HTML pages
app.get('/:page.html', (req, res) => {
  // Skip mod-manager.html as it's handled above
  if (req.params.page !== 'mod-manager') {
    res.sendFile(path.join(__dirname, req.params.page + '.html'));
  }
});

// =============================================================================
// ERROR HANDLERS - Must be last, after all other routes
// =============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TitanTech Server`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Security baseline: ENABLED`);
  console.log(`Session secret: ${SESSION_SECRET.length} characters`);
  console.log(`${'='.repeat(70)}\n`);
});