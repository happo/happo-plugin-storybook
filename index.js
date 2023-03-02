const { Writable } = require('stream');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const Archiver = require('archiver');
const rimraf = require('rimraf');

function zipFolderToBuffer(outputDir) {
  return new Promise((resolve, reject) => {
    const archive = new Archiver('zip');
    const stream = new Writable();
    const data = [];
    stream._write = (chunk, enc, done) => {
      data.push(...chunk);
      done();
    };
    stream.on('finish', () => {
      const buffer = Buffer.from(data);
      resolve(buffer);
    });
    archive.pipe(stream);
    archive.directory(outputDir, '');
    archive.on('error', reject);
    archive.finalize();
  });
}

function resolveBuildCommandParts() {
  const binary = fs.existsSync('yarn.lock') ? 'yarn' : 'npm';
  try {
    execSync(`${binary} list | grep 'storybook/react@[56]'`);
    // Storybook 6 or earlier, or the user has a custom build-storybook script
    // defined.
    return ['build-storybook'];
  } catch (e) {
    // Storybook 7 or later
    return ['storybook', 'build'];
  }
}

function buildStorybook({ configDir, staticDir, outputDir }) {
  return new Promise((resolve, reject) => {
    rimraf.sync(outputDir);
    const buildCommandParts = resolveBuildCommandParts();
    const params = [
      ...buildCommandParts,
      '--output-dir',
      outputDir,
      '--config-dir',
      configDir,
    ];
    if (staticDir) {
      params.push('--static-dir');
      params.push(staticDir);
    }
    const binary = fs.existsSync('yarn.lock') ? 'yarn' : 'npx';
    const spawned = spawn(binary, params, {
      stdio: 'inherit',
      shell: process.platform == 'win32',
    });

    spawned.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Failed to build static storybook package'));
      }
    });
  });
}

module.exports = function happoStorybookPlugin({
  configDir = '.storybook',
  staticDir,
  outputDir = '.out',
  usePrebuiltPackage = false,
} = {}) {
  return {
    generateStaticPackage: async () => {
      if (!usePrebuiltPackage) {
        await buildStorybook({ configDir, staticDir, outputDir });
      }
      const iframePath = path.join(outputDir, 'iframe.html');
      if (!fs.existsSync(iframePath)) {
        throw new Error(
          'Failed to build static storybook package (missing iframe.html)',
        );
      }
      try {
        const iframeContent = fs.readFileSync(iframePath, 'utf-8');
        fs.writeFileSync(
          iframePath,
          iframeContent.replace(
            '<head>',
            `<head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script type="text/javascript">window.__IS_HAPPO_RUN = true;</script>
          `,
          ),
        );
        const buffer = await zipFolderToBuffer(outputDir);
        return buffer.toString('base64');
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  };
};
