const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const API_HOSTNAME = '104.194.10.211';
const API_PORT = 3000;
const API_PATH = '/potnotifier/mods';
const API_TIMEOUT = 30000; // 30 seconds
const UPDATE_INTERVAL = 10 * 60 * 1000; // 10 minutes
const JSON_FILE_PATH = path.join(__dirname, 'ModINI', 'public', 'mods_details.json');

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`[${new Date().toISOString()}] Creating directory: ${dirPath}`);
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return true;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error creating directory: ${error.message}`);
      return false;
    }
  }
  return true;
}

// Function to transform mod data to the required format
function transformModData(rawMods) {
  console.log(`[${new Date().toISOString()}] Transforming data for ${rawMods.length} mods`);
  
  // Transform the data format
  const transformedMods = rawMods.map(mod => ({
    sku: mod.Mod_sku,
    name: mod.Mod_name,
    description: mod.Mod_description,
    icon: mod.Mod_image_link
  }));
  
  // Deduplicate by SKU
  const uniqueModsMap = new Map();
  const duplicates = [];
  
  transformedMods.forEach(mod => {
    if (!uniqueModsMap.has(mod.sku)) {
      uniqueModsMap.set(mod.sku, mod);
    } else {
      duplicates.push(mod.name);
    }
  });
  
  if (duplicates.length > 0) {
    console.log(`[${new Date().toISOString()}] Removed ${duplicates.length} duplicate entries`);
  }
  
  return Array.from(uniqueModsMap.values());
}

// Fallback data in case API fails
const fallbackData = [
  {
    sku: "FALLBACK_MOD_1",
    name: "Fallback Mod 1",
    description: "This is fallback data used when the API is unavailable.",
    icon: "https://via.placeholder.com/300x150?text=Fallback+Mod"
  },
  {
    sku: "FALLBACK_MOD_2",
    name: "Fallback Mod 2",
    description: "Please check your API connection.",
    icon: "https://via.placeholder.com/300x150?text=API+Unavailable"
  }
];

// Get existing data for backup purposes
function getExistingData() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error reading existing data: ${error.message}`);
  }
  return null;
}

// Save data to file with verification
function saveDataToFile(data, filePath) {
  const jsonContent = JSON.stringify(data, null, 2);
  
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error writing to file: ${err.message}`);
        reject(err);
        return;
      }
      
      // Verify file was written correctly
      fs.readFile(filePath, 'utf8', (readErr, fileContent) => {
        if (readErr) {
          console.error(`[${new Date().toISOString()}] Error reading file for verification: ${readErr.message}`);
          reject(readErr);
          return;
        }
        
        if (fileContent === jsonContent) {
          console.log(`[${new Date().toISOString()}] File verification successful: ${filePath}`);
          console.log(`[${new Date().toISOString()}] Wrote ${data.length} unique mods to the file`);
          resolve(true);
        } else {
          console.error(`[${new Date().toISOString()}] File verification failed: Content mismatch`);
          reject(new Error('File verification failed: Content mismatch'));
        }
      });
    });
  });
}

// Function to fetch data from API
function fetchFromAPI() {
  return new Promise((resolve, reject) => {
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
            console.log(`[${new Date().toISOString()}] Successfully fetched ${modsData.length} mods from API`);
            resolve(modsData);
          } catch (error) {
            console.error(`[${new Date().toISOString()}] Error parsing API response: ${error.message}`);
            reject(error);
          }
        } else {
          console.error(`[${new Date().toISOString()}] API returned status code: ${res.statusCode}`);
          reject(new Error(`API request failed with status code: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] API request error: ${error.message}`);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error(`[${new Date().toISOString()}] API request timed out`);
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}

// Main function to update mods data
async function updateModsData() {
  const startTime = new Date();
  console.log(`\n[${startTime.toISOString()}] ===== UPDATE CYCLE STARTED =====`);
  
  // Ensure directory structure exists
  const jsonDirPath = path.dirname(JSON_FILE_PATH);
  if (!ensureDirectoryExists(jsonDirPath)) {
    console.error(`[${new Date().toISOString()}] Cannot create required directories. Aborting update.`);
    return;
  }
  
  // Get existing data as backup
  const existingData = getExistingData();
  
  try {
    // Fetch data from API
    console.log(`[${new Date().toISOString()}] Fetching mods data from API...`);
    const apiData = await fetchFromAPI();
    
    if (apiData && apiData.length > 0) {
      // Transform and deduplicate the data
      const transformedData = transformModData(apiData);
      
      // Save the data
      await saveDataToFile(transformedData, JSON_FILE_PATH);
      
      console.log(`[${new Date().toISOString()}] ===== UPDATE CYCLE COMPLETED =====`);
      console.log(`[${new Date().toISOString()}] Time elapsed: ${(new Date() - startTime) / 1000} seconds\n`);
    } else {
      throw new Error('API returned empty array');
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during update: ${error.message}`);
    
    // Use existing data if available
    if (existingData && existingData.length > 0) {
      console.log(`[${new Date().toISOString()}] Restoring from existing data (${existingData.length} mods)`);
      await saveDataToFile(existingData, JSON_FILE_PATH);
    } else {
      // Use fallback data if no existing data
      console.log(`[${new Date().toISOString()}] Using fallback data`);
      await saveDataToFile(fallbackData, JSON_FILE_PATH);
    }
    
    console.log(`[${new Date().toISOString()}] ===== UPDATE CYCLE FAILED =====\n`);
  }
}

// Run immediately when script starts
console.log(`\n[${new Date().toISOString()}] ############################################`);
console.log(`[${new Date().toISOString()}] ###### STARTING MODS UPDATE SERVICE ######`);
console.log(`[${new Date().toISOString()}] ############################################`);
console.log(`[${new Date().toISOString()}] File path: ${JSON_FILE_PATH}`);
console.log(`[${new Date().toISOString()}] API endpoint: http://${API_HOSTNAME}:${API_PORT}${API_PATH}`);
console.log(`[${new Date().toISOString()}] Update interval: ${UPDATE_INTERVAL / 60000} minutes\n`);
updateModsData();

// Run periodically
setInterval(updateModsData, UPDATE_INTERVAL);
