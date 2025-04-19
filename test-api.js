const http = require('http');
const fs = require('fs');
const path = require('path');

// Path to the local JSON file
const jsonFilePath = path.join(__dirname, 'ModINI', 'public', 'mods_details.json');
console.log(`JSON file path: ${jsonFilePath}`);

// Check if file exists initially
console.log(`Does file exist before request? ${fs.existsSync(jsonFilePath)}`);
if (fs.existsSync(jsonFilePath)) {
  try {
    const fileContents = fs.readFileSync(jsonFilePath, 'utf8');
    console.log(`File initial contents length: ${fileContents.length} characters`);
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
  }
}

console.log('\n----- STARTING API REQUEST TEST -----\n');
console.log(`Time: ${new Date().toISOString()}`);

// Create HTTP request to the API with detailed logging
const options = {
  hostname: '104.194.10.211',
  port: 3000,
  path: '/potnotifier/mods',
  method: 'GET',
  timeout: 30000 // 30 second timeout
};

console.log(`Making HTTP request to: http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`\nRESPONSE RECEIVED:`);
  console.log(`Status code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let rawData = '';
  let dataChunks = 0;
  
  // Log each chunk received
  res.on('data', (chunk) => {
    dataChunks++;
    console.log(`Received data chunk ${dataChunks}: ${chunk.length} bytes`);
    rawData += chunk;
  });
  
  // Process complete response
  res.on('end', () => {
    console.log('\nRESPONSE COMPLETE:');
    console.log(`Total data length: ${rawData.length} bytes`);
    console.log(`Total chunks: ${dataChunks}`);
    
    if (rawData.length > 0) {
      try {
        // Try to parse as JSON to verify format
        console.log('\nAttempting to parse JSON...');
        const jsonData = JSON.parse(rawData);
        console.log(`Successfully parsed JSON! Found ${jsonData.length} items.`);
        
        // Preview the first item
        if (jsonData.length > 0) {
          console.log('\nFirst item preview:');
          console.log(JSON.stringify(jsonData[0], null, 2).substring(0, 500) + '...');
        }
        
        // Check for required fields
        console.log('\nChecking required fields in first item:');
        if (jsonData[0]) {
          const item = jsonData[0];
          console.log(`Mod_sku: ${item.Mod_sku ? 'PRESENT' : 'MISSING'}`);
          console.log(`Mod_name: ${item.Mod_name ? 'PRESENT' : 'MISSING'}`);
          console.log(`Mod_description: ${item.Mod_description ? 'PRESENT' : 'MISSING'}`);
          console.log(`Mod_image_link: ${item.Mod_image_link ? 'PRESENT' : 'MISSING'}`);
        }
        
        // Transform data to required format
        const transformedData = jsonData.map(item => ({
          sku: item.Mod_sku,
          name: item.Mod_name,
          description: item.Mod_description,
          icon: item.Mod_image_link
        }));
        
        // Write to file with immediate verification
        console.log('\nAttempting to write to file...');
        fs.writeFileSync(jsonFilePath, JSON.stringify(transformedData, null, 2));
        console.log('File written! Verifying...');
        
        // Read the file back to verify
        if (fs.existsSync(jsonFilePath)) {
          const fileContents = fs.readFileSync(jsonFilePath, 'utf8');
          console.log(`File now contains ${fileContents.length} characters`);
          console.log('First 200 characters of file:');
          console.log(fileContents.substring(0, 200) + '...');
          
          // Final check - parse the file content
          try {
            const fileJson = JSON.parse(fileContents);
            console.log(`File contains valid JSON with ${fileJson.length} items.`);
          } catch (err) {
            console.error(`Error parsing file contents: ${err.message}`);
          }
        } else {
          console.error('File does not exist after writing!');
        }
      } catch (error) {
        console.error('\nJSON PARSE ERROR!');
        console.error(error.message);
        console.log('\nRaw data preview (first 500 characters):');
        console.log(rawData.substring(0, 500) + '...');
      }
    } else {
      console.error('\nEmpty response received!');
    }
    console.log('\n----- API REQUEST TEST COMPLETE -----');
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error(`\nREQUEST ERROR: ${error.message}`);
  console.log('Full error:');
  console.log(error);
  
  // Check if DNS failed
  if (error.code === 'ENOTFOUND') {
    console.log('\nDNS lookup failed. Let\'s try to ping the host:');
    const { exec } = require('child_process');
    exec(`ping ${options.hostname}`, (err, stdout, stderr) => {
      console.log(stdout);
    });
  }
  
  console.log('\n----- API REQUEST TEST FAILED -----');
});

// Handle timeout
req.on('timeout', () => {
  console.error('\nREQUEST TIMEOUT: The request took too long to complete.');
  req.destroy();
  console.log('\n----- API REQUEST TEST FAILED -----');
});

console.log('Request sent, waiting for response...');
req.end();
