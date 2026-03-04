/**
 * Profile Manager Module
 *
 * Handles CRUD operations for user profiles stored as JSON files.
 * Profiles are organized by Discord user ID and generator type.
 *
 * Directory structure:
 *   data/profiles/{discordUserId}/{generatorType}/{profileId}.json
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const DATA_DIR = path.join(__dirname, '../../data');
const PROFILES_DIR = path.join(DATA_DIR, 'profiles');
const MAX_PROFILES_PER_TYPE = 10;
const MAX_PROFILE_SIZE_BYTES = 100 * 1024; // 100KB

// Valid generator types
const VALID_GENERATOR_TYPES = ['commands-ini', 'game-ini', 'rules-motd'];

/**
 * Validate Discord user ID (should be numeric string)
 */
function isValidDiscordId(id) {
  return typeof id === 'string' && /^\d{17,19}$/.test(id);
}

/**
 * Validate generator type
 */
function isValidGeneratorType(type) {
  return VALID_GENERATOR_TYPES.includes(type);
}

/**
 * Validate UUID v4 format
 */
function isValidUuid(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Get the directory path for a user's profiles of a specific type
 */
function getUserProfileDir(discordUserId, generatorType) {
  if (!isValidDiscordId(discordUserId)) {
    throw new Error('Invalid Discord user ID');
  }
  if (!isValidGeneratorType(generatorType)) {
    throw new Error('Invalid generator type');
  }
  return path.join(PROFILES_DIR, discordUserId, generatorType);
}

/**
 * Get the file path for a specific profile
 */
function getProfileFilePath(discordUserId, generatorType, profileId) {
  if (!isValidUuid(profileId)) {
    throw new Error('Invalid profile ID');
  }
  const dir = getUserProfileDir(discordUserId, generatorType);
  const filePath = path.join(dir, `${profileId}.json`);

  // Security: Ensure the resolved path is within the profiles directory
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(PROFILES_DIR))) {
    throw new Error('Invalid path: potential directory traversal');
  }

  return filePath;
}

/**
 * Ensure profile directory exists for a user/type combination
 */
function ensureProfileDirectory(discordUserId, generatorType) {
  const dir = getUserProfileDir(discordUserId, generatorType);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created profile directory: ${dir}`);
  }
  return dir;
}

/**
 * Load all profiles for a user and generator type
 * Returns array of profile metadata (without full data for efficiency)
 */
function loadUserProfiles(discordUserId, generatorType) {
  try {
    const dir = getUserProfileDir(discordUserId, generatorType);

    if (!fs.existsSync(dir)) {
      return [];
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const profiles = [];

    for (const file of files) {
      try {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const profile = JSON.parse(content);

        // Return metadata only (not the full data for list view)
        profiles.push({
          id: profile.id,
          name: profile.name,
          generatorType: profile.generatorType,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        });
      } catch (err) {
        console.error(`Error reading profile file ${file}:`, err.message);
        // Skip corrupted files
      }
    }

    // Sort by updatedAt descending (most recent first)
    profiles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return profiles;
  } catch (err) {
    console.error(`Error loading profiles for user ${discordUserId}:`, err.message);
    return [];
  }
}

/**
 * Get a specific profile by ID
 * Returns full profile including data
 */
function getProfile(discordUserId, generatorType, profileId) {
  try {
    const filePath = getProfileFilePath(discordUserId, generatorType, profileId);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const profile = JSON.parse(content);

    // Verify ownership (extra safety check)
    if (profile.discordUserId !== discordUserId) {
      console.error(`Profile ownership mismatch: expected ${discordUserId}, got ${profile.discordUserId}`);
      return null;
    }

    return profile;
  } catch (err) {
    console.error(`Error getting profile ${profileId}:`, err.message);
    return null;
  }
}

/**
 * Create a new profile
 * Returns the created profile or null on error
 */
function createProfile(discordUserId, generatorType, profileData) {
  try {
    // Validate inputs
    if (!isValidDiscordId(discordUserId)) {
      throw new Error('Invalid Discord user ID');
    }
    if (!isValidGeneratorType(generatorType)) {
      throw new Error('Invalid generator type');
    }
    if (!profileData.name || typeof profileData.name !== 'string') {
      throw new Error('Profile name is required');
    }

    // Check profile limit
    const existingProfiles = loadUserProfiles(discordUserId, generatorType);
    if (existingProfiles.length >= MAX_PROFILES_PER_TYPE) {
      throw new Error(`Maximum ${MAX_PROFILES_PER_TYPE} profiles allowed per generator type`);
    }

    // Create profile object
    const now = new Date().toISOString();
    const profile = {
      id: uuidv4(),
      name: profileData.name.trim().substring(0, 50), // Enforce max length
      generatorType: generatorType,
      discordUserId: discordUserId,
      createdAt: now,
      updatedAt: now,
      data: profileData.data || {}
    };

    // Check size
    const profileJson = JSON.stringify(profile, null, 2);
    if (Buffer.byteLength(profileJson, 'utf8') > MAX_PROFILE_SIZE_BYTES) {
      throw new Error('Profile data exceeds maximum size limit');
    }

    // Ensure directory exists
    ensureProfileDirectory(discordUserId, generatorType);

    // Write file
    const filePath = getProfileFilePath(discordUserId, generatorType, profile.id);
    fs.writeFileSync(filePath, profileJson, 'utf8');

    console.log(`Created profile ${profile.id} for user ${discordUserId} (${generatorType})`);

    return profile;
  } catch (err) {
    console.error(`Error creating profile:`, err.message);
    throw err;
  }
}

/**
 * Update an existing profile
 * Returns the updated profile or null on error
 */
function updateProfile(discordUserId, generatorType, profileId, updateData) {
  try {
    // Get existing profile
    const existingProfile = getProfile(discordUserId, generatorType, profileId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Verify ownership
    if (existingProfile.discordUserId !== discordUserId) {
      throw new Error('Profile does not belong to this user');
    }

    // Update allowed fields
    const updatedProfile = {
      ...existingProfile,
      name: updateData.name ? updateData.name.trim().substring(0, 50) : existingProfile.name,
      data: updateData.data !== undefined ? updateData.data : existingProfile.data,
      updatedAt: new Date().toISOString()
    };

    // Check size
    const profileJson = JSON.stringify(updatedProfile, null, 2);
    if (Buffer.byteLength(profileJson, 'utf8') > MAX_PROFILE_SIZE_BYTES) {
      throw new Error('Profile data exceeds maximum size limit');
    }

    // Write file
    const filePath = getProfileFilePath(discordUserId, generatorType, profileId);
    fs.writeFileSync(filePath, profileJson, 'utf8');

    console.log(`Updated profile ${profileId} for user ${discordUserId}`);

    return updatedProfile;
  } catch (err) {
    console.error(`Error updating profile ${profileId}:`, err.message);
    throw err;
  }
}

/**
 * Delete a profile
 * Returns true on success, throws on error
 */
function deleteProfile(discordUserId, generatorType, profileId) {
  try {
    // Verify profile exists and belongs to user
    const existingProfile = getProfile(discordUserId, generatorType, profileId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    if (existingProfile.discordUserId !== discordUserId) {
      throw new Error('Profile does not belong to this user');
    }

    // Delete file
    const filePath = getProfileFilePath(discordUserId, generatorType, profileId);
    fs.unlinkSync(filePath);

    console.log(`Deleted profile ${profileId} for user ${discordUserId}`);

    return true;
  } catch (err) {
    console.error(`Error deleting profile ${profileId}:`, err.message);
    throw err;
  }
}

/**
 * Get profile count for a user and generator type
 */
function getProfileCount(discordUserId, generatorType) {
  try {
    const dir = getUserProfileDir(discordUserId, generatorType);
    if (!fs.existsSync(dir)) {
      return 0;
    }
    return fs.readdirSync(dir).filter(f => f.endsWith('.json')).length;
  } catch (err) {
    return 0;
  }
}

module.exports = {
  loadUserProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileCount,
  isValidDiscordId,
  isValidGeneratorType,
  isValidUuid,
  VALID_GENERATOR_TYPES,
  MAX_PROFILES_PER_TYPE,
  MAX_PROFILE_SIZE_BYTES
};
