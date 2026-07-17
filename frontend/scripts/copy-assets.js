/**
 * Script to copy gambar files from Laravel public to Next.js public
 * Run: node scripts/copy-assets.js
 */
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', '..', 'public', 'gambar');
const dest = path.resolve(__dirname, '..', 'public', 'gambar');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
  console.log('Created directory:', dest);
}

const files = fs.readdirSync(src);
files.forEach(file => {
  const srcFile = path.join(src, file);
  // Rename to remove spaces
  const destFile = path.join(dest, file.replace(/\s+/g, ''));
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied: ${file} -> ${path.basename(destFile)}`);
});

console.log('Done!');
