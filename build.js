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

// Add all files with the plugin folder name as prefix
// Stream Deck expects: pluginName.streamDeckPlugin/pluginName/manifest.json
const prefix = pluginName + '/';

archive.file('manifest.json', { name: prefix + 'manifest.json' });
archive.file('package.json', { name: prefix + 'package.json' });
archive.directory('bin/', prefix + 'bin');
archive.directory('propertyinspector/', prefix + 'propertyinspector');

// Add images if they exist
if (fs.existsSync('images')) {
  archive.directory('images/', prefix + 'images');
}

// Add node_modules only if they exist
if (fs.existsSync('node_modules')) {
  archive.directory('node_modules/', prefix + 'node_modules');
}

archive.finalize();
