const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Build frontend
console.log('Building frontend...');
execSync('npm run build:client', { stdio: 'inherit' });

// Copy service worker to dist
console.log('Copying service worker...');
fs.copyFileSync(
  path.join(__dirname, 'client', 'public', 'service-worker.js'),
  path.join(__dirname, 'dist', 'service-worker.js')
);

console.log('Build complete! Ready for deployment.');