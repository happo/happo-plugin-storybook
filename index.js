const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const getStorybook7BuildCommandParts = require('./getStorybook7BuildCommandParts');
const getStorybookVersionFromPackageJson = require('./getStorybookVersionFromPackageJson');

const { HAPPO_DEBUG, HAPPO_STORYBOOK_BUILD_COMMAND } = process.env;

function validateSkipped(skipped) {
  if (!Array.isArray(skipped)) {
    throw new Error(`The \`skip\` option didn't provide an array`);
  }
  if (skipped.some((item) => !item.component || !item.variant)) {
    throw new Error(
      `Each item provided by the \`skip\` option need a \`component\` and a \`variant\` property`,
    );
  }
}

function resolveBuildCommandParts() {
  if (HAPPO_STORYBOOK_BUILD_COMMAND) {
    return HAPPO_STORYBOOK_BUILD_COMMAND.split(' ');
  }
  try {
    const version = getStorybookVersionFromPackageJson();
    if (version === 6) {
      return ['build-storybook'];
    }
    if (version === 7) {
      return getStorybook7BuildCommandParts();
    }
  } catch (e) {
    if (HAPPO_DEBUG) {
      console.log(
        '[happo] Check for Storybook version in package.json failed. Details:',
        e,
      );
    }
  }
  const binary = fs.existsSync('yarn.lock') ? 'yarn' : 'npm';
  try {
    execSync(`${binary} list | grep 'storybook/react@[56]'`);
    // Storybook 6 or earlier
    return ['build-storybook'];
  } catch (e) {
    if (HAPPO_DEBUG) {
      console.log('[happo] Check for Storybook v6 failed. Details:', e);
    }
  }
  try {
    execSync(`${binary} storybook --version`);
    // Storybook v7 or later
    return getStorybook7BuildCommandParts();
  } catch (e) {
    if (HAPPO_DEBUG) {
      console.log('[happo] Check for Storybook v7 failed. Details:', e);
    }
  }
  try {
    execSync(`${binary} build-storybook --version`);
    return ['build-storybook'];
  } catch (e) {
    if (HAPPO_DEBUG) {
      console.log(
        '[happo] Check for build-storybook command failed. Details:',
        e,
      );
    }
  }
  // Storybook 7 or later
  return getStorybook7BuildCommandParts();
}

function buildStorybook({ configDir, staticDir, outputDir }) {
  return new Promise((resolve, reject) => {
    fs.rmSync(outputDir, { recursive: true, force: true });
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
    let binary = fs.existsSync('yarn.lock') ? 'yarn' : 'npx';

    if (buildCommandParts[0].includes('node_modules')) {
      binary = buildCommandParts[0];
      params.shift(); // remove binary from params
    }

    if (HAPPO_DEBUG) {
      console.log(
        `[happo] Using build command \`${binary} ${params.join(' ')}\``,
      );
    }
    const spawned = spawn(binary, params, {
      stdio: 'inherit',
      shell: process.platform == 'win32',
    });

    spawned.on('exit', (code) => {
      if (code === 0) {
        try {
          fs.unlinkSync(path.join(outputDir, 'project.json'));
        } catch (error) {
          console.warn(
            `Ignoring error when attempting to remove project.json: ${error}`,
          );
        }
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
  skip,
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
        const skipped =
          typeof skip === 'function'
            ? await skip()
            : Array.isArray(skip)
            ? skip
            : [];
        validateSkipped(skipped);
        const iframeContent = fs.readFileSync(iframePath, 'utf-8');
        fs.writeFileSync(
          iframePath,
          iframeContent.replace(
            '<head>',
            `<head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script type="text/javascript">window.__IS_HAPPO_RUN = true;</script>
            <script type="text/javascript">window.happoSkipped = ${JSON.stringify(
              skipped,
            )};</script>
          `,
          ),
        );
        // Tell happo.io where the files are located.
        return { path: outputDir };
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  };
};
