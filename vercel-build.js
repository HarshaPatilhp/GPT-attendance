const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build script...');
console.log('Node version:', process.version);

// Ensure required directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PATH = `${process.env.PATH}:${process.env.HOME}/.npm-global/bin`;

// Install dependencies
console.log('Installing dependencies...');
try {
  // Use npm ci for clean install
  execSync('npm ci --prefer-offline', { 
    stdio: 'inherit',
    env: process.env
  });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Build the application
console.log('Building application...');
try {
  execSync('npm run build', { 
    stdio: 'inherit',
    env: process.env
  });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
