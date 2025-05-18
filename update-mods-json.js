/**
 * This script fetches mods data from the API and updates the local JSON file
 * It properly preserves creator information from both API and existing mappings
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const API_HOSTNAME = '104.243.37.159';
const API_PORT = 25056;
const API_PATH = '/api/mods';
const API_TIMEOUT = 30000; // 30 seconds
const JSON_FILE_PATH = path.join(__dirname, 'ModINI', 'public', 'mods_details.json');
const BACKUP_PATH = path.join(__dirname, 'ModINI', 'public', 'mods_details_backup.json');

// Create a backup of the current file
function backupCurrentFile() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      fs.copyFileSync(JSON_FILE_PATH, BACKUP_PATH);
      console.log(`Backed up current file to ${BACKUP_PATH}`);
      return true;
    }
  } catch (error) {
    console.error(`Failed to create backup: ${error.message}`);
  }
  return false;
}

// Read existing mods data
function readExistingData() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading existing data: ${error.message}`);
  }
  return [];
}

// Fetch data from API
function fetchFromAPI() {
  return new Promise((resolve, reject) => {
    console.log(`Connecting to API at http://${API_HOSTNAME}:${API_PORT}${API_PATH}...`);
    
    const req = http.request({
      hostname: API_HOSTNAME,
      port: API_PORT,
      path: API_PATH,
      method: 'GET',
      timeout: API_TIMEOUT
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 && data.length > 0) {
          try {
            const modsData = JSON.parse(data);
            console.log(`Successfully fetched ${modsData.length} mods from API`);
            resolve(modsData);
          } catch (error) {
            console.error(`Error parsing API response: ${error.message}`);
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

// Save data to file
function saveToFile(data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write sorted mods to file
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully saved ${data.length} mods to ${JSON_FILE_PATH}`);
    return true;
  } catch (error) {
    console.error(`Error writing to file: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log("Starting update of mods_details.json with correct creator information");
  
  // Back up current file
  backupCurrentFile();
  
  // Read existing data to preserve creator information
  const existingMods = readExistingData();
  console.log(`Read ${existingMods.length} existing mods`);
  
  // Create a map of existing mods by SKU for quick lookup
  const existingModMap = {};
  existingMods.forEach(mod => {
    if (mod.sku) {
      existingModMap[mod.sku] = mod;
    }
  });
  
  try {
    // Fetch new data from API
    const apiResponse = await fetchFromAPI();
    // Support both array and object-with-mods formats
    const apiMods = Array.isArray(apiResponse) ? apiResponse : apiResponse.mods;
    if (!Array.isArray(apiMods)) {
      throw new Error('API response does not contain a mods array');
    }
    // Transform API data to our format using correct API field names
    const transformedMods = apiMods.map(apiMod => {
      return {
        sku: apiMod.sku,
        name: apiMod.name,
        description: apiMod.description || "",
        icon: apiMod.icon || "",
        creator: apiMod.creator || "Unknown Creator"
      };
    });
    
    // Deduplicate by SKU (in case API has duplicates)
    const uniqueModsMap = new Map();
    transformedMods.forEach(mod => {
      if (mod.sku) {
        uniqueModsMap.set(mod.sku, mod);
      }
    });
    
    // Convert back to array and sort alphabetically
    const sortedMods = Array.from(uniqueModsMap.values());
    sortedMods.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    
    // Save the sorted mods to file
    if (saveToFile(sortedMods)) {
      // Show statistics
      const creatorCounts = {};
      sortedMods.forEach(mod => {
        creatorCounts[mod.creator] = (creatorCounts[mod.creator] || 0) + 1;
      });
      
      console.log("\nCreator distribution in updated file:");
      Object.entries(creatorCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([creator, count]) => {
          console.log(`${creator}: ${count} mods`);
        });
      
      console.log("\nUpdate completed successfully!");
    }
  } catch (error) {
    console.error(`Failed to update mods: ${error.message}`);
  }
}

// Run the script
main();
