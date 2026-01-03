const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const pluginName = 'com.jase.steambp.sdPlugin';
const output = fs.createWriteStream(path.join(__dirname, `${pluginName}.streamDeckPlugin`));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Plugin built: ${archive.pointer()} total bytes`);
  console.log(`File: ${pluginName}.streamDeckPlugin`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add all necessary files
archive.file('manifest.json', { name: 'manifest.json' });
archive.file('package.json', { name: 'package.json' });
archive.directory('bin/', 'bin');
archive.directory('propertyinspector/', 'propertyinspector');

// Add images if they exist
if (fs.existsSync('images')) {
  archive.directory('images/', 'images');
}

// Add node_modules only if they exist
if (fs.existsSync('node_modules')) {
  archive.directory('node_modules/', 'node_modules');
}

archive.finalize();
