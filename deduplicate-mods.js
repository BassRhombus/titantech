const fs = require('fs');
const path = require('path');

// Path to the mods JSON file
const jsonFilePath = path.join(__dirname, 'ModINI', 'public', 'mods_details.json');

console.log(`Starting deduplication and alphabetical sorting of ${jsonFilePath}`);

// Read the current JSON file
try {
  const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
  const mods = JSON.parse(fileContent);
  
  console.log(`Read ${mods.length} total mod entries`);
  
  // Track duplicates for reporting
  const duplicates = [];
  
  // Use a Map to deduplicate by SKU
  const uniqueModsMap = new Map();
  
  mods.forEach(mod => {
    if (!uniqueModsMap.has(mod.sku)) {
      // First time seeing this SKU
      uniqueModsMap.set(mod.sku, mod);
    } else {
      // This is a duplicate
      duplicates.push(mod.name);
    }
  });
  
  // Convert back to array
  let uniqueMods = Array.from(uniqueModsMap.values());
  
  console.log(`Found ${duplicates.length} duplicate entries to remove`);
  if (duplicates.length > 0) {
    console.log('Duplicates found:');
    duplicates.forEach(name => console.log(`- ${name}`));
  }
  
  // Sort mods alphabetically by name
  console.log('Sorting mods alphabetically by name...');
  uniqueMods.sort((a, b) => {
    // Case-insensitive comparison of names
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  
  // Save the deduplicated and sorted data
  fs.writeFileSync(jsonFilePath, JSON.stringify(uniqueMods, null, 2));
  
  console.log(`Saved deduplicated and alphabetically sorted file with ${uniqueMods.length} unique mods`);
} catch (error) {
  console.error('Error processing mods file:', error.message);
}
