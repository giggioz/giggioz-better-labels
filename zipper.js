const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const moduleDir = path.resolve(__dirname);
const moduleName = path.basename(moduleDir);
const outputZipPath = path.join(moduleDir, `module.zip`);

function zipModule() {
  const output = fs.createWriteStream(outputZipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`Zipped ${moduleName} (${archive.pointer()} total bytes) to ${outputZipPath}`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Correctly include files using glob
  archive.glob('**/*', {
    cwd: moduleDir,
    ignore: ['.git/**', 'node_modules/**', '*.zip']
  });

  // Finalize the archive
  archive.finalize();
}

zipModule();
