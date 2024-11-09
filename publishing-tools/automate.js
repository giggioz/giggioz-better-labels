// require('dotenv').config(); // Load .env variable

const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const archiver = require('archiver');
const axios = require('axios');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('sssssss', process.env.GITHUB_TOKEN)
// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'giggioz'; // Replace with your GitHub username
const REPO_NAME = 'giggioz-better-labels';

// Update the paths to point to the parent directory where module.json is located
const moduleDir = path.resolve(__dirname, '../'); // Parent directory of publishing-tools
const moduleJsonPath = path.join(moduleDir, 'module.json');
const outputZipPath = path.join(moduleDir, `module.zip`);

async function updateVersion() {
  const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
  const oldVersion = moduleJson.version;
  const [major, minor, patch] = oldVersion.split('.').map(Number);

  const newVersion = `${major}.${minor}.${patch + 1}`;
  moduleJson.version = newVersion;

  fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 2));
  console.log(`Updated module.json version: ${oldVersion} -> ${newVersion}`);

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
      ignore: ['.git/**', 'node_modules/**', '*.zip', '.env', '.DS_Store', 'publishing-tools/**'] // Exclude publishing-tools directory as well
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

async function createGitHubRelease(newVersion) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`;

  const response = await axios.post(url, {
    tag_name: `v${newVersion}`,
    name: `v${newVersion}`,
    body: `Release version ${newVersion}`,
  }, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const releaseId = response.data.id;
  console.log(`Release created: ${response.data.html_url}`);

  const uploadUrl = response.data.upload_url.replace('{?name,label}', '');

  await uploadReleaseAsset(uploadUrl, 'module.json', moduleJsonPath);
  await uploadReleaseAsset(uploadUrl, 'module.zip', outputZipPath);

  console.log('Assets uploaded to release.');
}

async function uploadReleaseAsset(uploadUrl, assetName, assetPath) {
  const fileData = fs.readFileSync(assetPath);

  await axios.post(`${uploadUrl}?name=${assetName}`, fileData, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/zip',
      'Content-Length': fileData.length,
    },
  });

  console.log(`Uploaded ${assetName} to release.`);
}

async function runWorkflow() {
  try {
    const newVersion = await updateVersion();
    await zipModule();
    await gitOperations(newVersion);
    await createGitHubRelease(newVersion);
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

runWorkflow();
