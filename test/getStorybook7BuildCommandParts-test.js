const path = require('path');

const getStorybook7BuildCommandParts = require('../getStorybook7BuildCommandParts');

describe('with project package.json', () => {
  it('returns the right command', () => {
    const parts = getStorybook7BuildCommandParts();
    expect(parts).toEqual(['storybook', 'build']);
  });
});

describe('with a storybook script', () => {
  xit('uses binary in node_modules/.bin', () => {
    const parts = getStorybook7BuildCommandParts(
      path.resolve(__dirname, 'no-devdeps-package.json'),
    );
    expect(parts[0]).toMatch(/node_modules\/\.bin/);
    expect(parts[1]).toEqual('build');
  });
});
