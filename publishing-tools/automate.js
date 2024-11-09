const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const archiver = require('archiver');
const axios = require('axios');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'giggioz'; // Replace with your GitHub username
const REPO_NAME = 'giggioz-better-labels';

// Paths
const moduleDir = path.resolve(__dirname, '../'); // Parent directory of publishing-tools
const moduleJsonPath = path.join(moduleDir, 'module.json');
const outputZipPath = path.join(moduleDir, `module.zip`);
const globalJsPath = path.join(moduleDir, 'scripts', 'global.js');

async function updateVersion() {
  const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
  const oldVersion = moduleJson.version;
  const [major, minor, patch] = oldVersion.split('.').map(Number);

  const newVersion = `${major}.${minor}.${patch + 1}`;
  moduleJson.version = newVersion;

  // Update manifest and download URLs to always point to the latest release
  moduleJson.manifest = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/latest/module.json`;
  moduleJson.download = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/latest/module.zip`;

  fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 2));
  console.log(`Updated module.json version: ${oldVersion} -> ${newVersion}`);

  // Temporarily set mode to production in global.js
  let globalJs = fs.readFileSync(globalJsPath, 'utf-8');
  globalJs = globalJs.replace(`mode: 'development'`, `mode: 'production'`);
  fs.writeFileSync(globalJsPath, globalJs);
  console.log('Temporarily set mode to production in global.js');

  // Restore mode to development after process completion
  process.on('exit', () => {
    let globalJsRestore = fs.readFileSync(globalJsPath, 'utf-8');
    globalJsRestore = globalJsRestore.replace(`mode: 'production'`, `mode: 'development'`);
    fs.writeFileSync(globalJsPath, globalJsRestore);
    console.log('Restored mode to development in global.js');
  });

  return newVersion;
}

function zipModule() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Created zip: ${outputZipPath}`);
      resolve();
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.glob('**/*', {
      cwd: moduleDir,
      ignore: ['.git/**', 'node_modules/**', '*.zip', '.env', '.DS_Store', 'publishing-tools/**', 'package.json', 'package-lock.json']
    });
    archive.finalize();
  });
}

async function gitOperations(newVersion) {
  const git = simpleGit(moduleDir);

  await git.add('./*');
  await git.commit(`Release version ${newVersion}`);
  await git.tag([`v${newVersion}`]);

  await git.push('origin', 'main');
  await git.pushTags('origin');

  console.log('Changes committed and pushed with tag:', `v${newVersion}`);
}

async function getLatestRelease() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch the latest release:', error.message);
    throw error;
  }
}

async function uploadAssetsToLatestRelease() {
  const latestRelease = await getLatestRelease();
  const uploadUrl = latestRelease.upload_url.replace('{?name,label}', '');

  await uploadReleaseAsset(uploadUrl, 'module.json', moduleJsonPath);
  await uploadReleaseAsset(uploadUrl, 'module.zip', outputZipPath);

  console.log('Assets uploaded to the latest release.');
}

async function uploadReleaseAsset(uploadUrl, assetName, assetPath) {
  const fileData = fs.readFileSync(assetPath);

  await axios.post(`${uploadUrl}?name=${assetName}`, fileData, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': assetName.endsWith('.json') ? 'application/json' : 'application/zip',
      'Content-Length': fileData.length,
    },
  });

  console.log(`Uploaded ${assetName} to the latest release.`);
}

async function cleanup() {
  try {
    if (fs.existsSync(outputZipPath)) {
      fs.unlinkSync(outputZipPath);
      console.log(`Deleted zip file: ${outputZipPath}`);
    }
  } catch (error) {
    console.error(`Failed to delete zip file: ${error.message}`);
  }
}

async function runWorkflow() {
  try {
    const newVersion = await updateVersion();
    await zipModule();
    await gitOperations(newVersion);
    await uploadAssetsToLatestRelease();
  } catch (error) {
    console.error('Workflow failed:', error);
  } finally {
    await cleanup();
  }
}

runWorkflow();
