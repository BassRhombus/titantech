const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

async function updateModsData() {
  try {
    console.log(`Starting mods update at ${new Date().toISOString()}`);
    
    // Fetch from the external API
    console.log('Fetching data from API...');
    const response = await fetch('http://104.194.10.211:3000/potnotifier/mods');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const modsData = await response.json();
    console.log(`Received ${modsData.length} mods from API`);
    
    // Write to the local JSON file
    const filePath = path.join(__dirname, 'ModINI/public/mods_details.json');
    await fs.writeFile(filePath, JSON.stringify(modsData, null, 2));
    console.log(`Written data to ${filePath}`);
    
    console.log(`Mods data updated successfully at ${new Date().toISOString()}`);
    return true;
  } catch (error) {
    console.error('Error updating mods data:', error);
    return false;
  }
}

// Run initially when script starts
updateModsData();

// Run every 10 minutes
setInterval(updateModsData, 10 * 60 * 1000);

console.log('Update script started. Will check for new mods every 10 minutes.');
