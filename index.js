const { exec } = require('child_process');
const fs = require('fs');
const { Writable } = require('stream');

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
        const commandParts = [
          '$(npm bin)/build-storybook',
          '--output-dir',
          outputDir,
          '--config-dir',
          configDir,
        ];
        if (staticDir) {
          commandParts.push('--static-dir');
          commandParts.push(staticDir);
        }
        const cmd = commandParts.join(' ');
        exec(cmd, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
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
