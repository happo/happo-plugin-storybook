import { Writable } from 'stream';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import Archiver from 'archiver';
import { rimraf } from 'rimraf';

import getStorybook7BuildCommandParts from './getStorybook7BuildCommandParts';
import getStorybookVersionFromPackageJson from './getStorybookVersionFromPackageJson';

const { HAPPO_DEBUG, HAPPO_STORYBOOK_BUILD_COMMAND } = process.env;

function zipFolderToBuffer(outputDir: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = Archiver('zip', {});
    const stream = new Writable();
    const data: any[] = [];
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
  if (HAPPO_STORYBOOK_BUILD_COMMAND) {
    return HAPPO_STORYBOOK_BUILD_COMMAND.split(' ');
  }
  try {
    const version = getStorybookVersionFromPackageJson();
    if (version === 6) {
      return ['build-storybook'];
    }
    if (version >= 7) {
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
      console.log('[happo] Check for Storybook v7+ failed. Details:', e);
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

function buildStorybook({ configDir, staticDir, outputDir }: {configDir: string, staticDir?: string, outputDir: string}): Promise<void> {
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
        resolve(undefined);
      } else {
        reject(new Error('Failed to build static storybook package'));
      }
    });
  });
}

export default function happoStorybookPlugin({
  configDir = '.storybook',
  staticDir,
  outputDir = '.out',
  usePrebuiltPackage = false,
}: {configDir?: string, staticDir?: string, outputDir?: string, usePrebuiltPackage?: boolean} = {}) {
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
