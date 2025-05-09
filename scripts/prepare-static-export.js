const fs = require('fs');
const path = require('path');

// Path to the output directory
const outDir = path.join(__dirname, '../out');

console.log('Preparing static export for deployment...');

// Ensure the app directory exists
const appDir = path.join(outDir, 'app');
if (!fs.existsSync(appDir)) {
  console.log('Creating app directory...');
  fs.mkdirSync(appDir, { recursive: true });
}

// Check if app.html exists (the old export format)
const appHtmlPath = path.join(outDir, 'app.html');
if (fs.existsSync(appHtmlPath)) {
  console.log('Found app.html - ensuring it is properly served from /app/...');
  
  // Either copy app.html to app/index.html (if app/index.html doesn't already exist)
  const appIndexPath = path.join(appDir, 'index.html');
  if (!fs.existsSync(appIndexPath)) {
    console.log('Copying app.html to app/index.html');
    fs.copyFileSync(appHtmlPath, appIndexPath);
  }
}

console.log('Static export preparation complete!'); 
