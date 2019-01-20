const { Writable } = require('stream');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const Archiver = require('archiver');

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

module.exports = function happoStorybookPlugin({
  configDir = '.storybook',
  staticDir,
  outputDir = '.out',
} = {}) {
  return {
    generateStaticPackage: async () => {
      await new Promise((resolve, reject) => {
        const params = ['--output-dir', outputDir, '--config-dir', configDir];
        if (staticDir) {
          params.push('--static-dir');
          params.push(staticDir);
        }
        const spawned = spawn('node_modules/.bin/build-storybook', params, {
          stdio: 'inherit',
        });

        spawned.on('exit', code => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error('Failed to build static storybook package'));
          }
        });
      });
      if (!fs.existsSync(path.join(outputDir, 'iframe.html'))) {
        throw new Error('Failed to build static storybook package (missing iframe.html)');
      }
      try {
        const buffer = await zipFolderToBuffer(outputDir);
        return buffer.toString('base64');
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  };
};
