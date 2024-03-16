import fs from 'fs';
import path from 'path';

const { HAPPO_DEBUG } = process.env;

export default function getStorybook7BuildCommandParts(
  packageJsonPath = path.join(process.cwd(), 'package.json'),
) {
  try {
    const data = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);
    if (packageJson.scripts.storybook) {
      if (HAPPO_DEBUG) {
        console.log(
          '[happo] Found `storybook` script in package.json. Will attempt to use binary found at `node_modules/.bin/storybook` instead',
        );
      }
      const pathToStorybookCommand = path.join(
        process.cwd(),
        'node_modules',
        '.bin',
        'storybook',
      );
      if (fs.existsSync(pathToStorybookCommand)) {
        return [pathToStorybookCommand, 'build'];
      }
    }
  } catch (e) {
    if (HAPPO_DEBUG) {
      console.log(
        '[happo] Caught error when resolving Storybook 7 build command parts. Will use default.',
        e,
      );
    }
  }
  return ['storybook', 'build'];
};
