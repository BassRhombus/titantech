const fs = require('fs');
const { execSync } = require('child_process');

if (fs.existsSync('.next')) {
  console.log('Build exists, skipping...');
} else {
  console.log('No build found, building...');
  execSync('npx next build', { stdio: 'inherit' });
}
