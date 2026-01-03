const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const pluginName = 'com.jase.steambp.sdPlugin';
const pluginPath = path.join(__dirname, pluginName);
const destPath = path.join(process.env.APPDATA, 'Elgato', 'StreamDeck', 'Plugins', pluginName);

console.log('Installing plugin to Stream Deck...');
console.log(`Source: ${pluginPath}`);
console.log(`Destination: ${destPath}`);

// Remove existing plugin if it exists
if (fs.existsSync(destPath)) {
  console.log('Removing existing plugin...');
  fs.rmSync(destPath, { recursive: true, force: true });
}

// Copy plugin files
console.log('Copying plugin files...');
copyRecursive(__dirname, destPath, [
  '.git',
  '.streamDeckPlugin',
  'build.js',
  'install.js',
  'convert-icons.js',
  'README.md',
  'README-GITHUB.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'MARKETPLACE.md'
]);

console.log('Plugin installed successfully!');
console.log('Please restart Stream Deck software to load the plugin.');

function copyRecursive(src, dest, exclude = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip excluded items
    if (exclude.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
