const assert = require('assert');
const path = require('path');
const fs = require('fs');

const constructPlugin = require('./');

let configDir = '.storybook-test';

const subject = () => constructPlugin({
  configDir,
});
let webpackConfig = subject().customizeWebpackConfig({
  a: 'b',
  plugins: [],
  module: {
    rules: [],
  },
});
assert.strictEqual(webpackConfig.a, 'b');
assert.strictEqual(webpackConfig.module.rules.length, 1);
assert.strictEqual(webpackConfig.module.rules[0], 'rule1');

let defs = webpackConfig.plugins[0].definitions;
let HAPPO = JSON.parse(defs.HAPPO);
let HAPPO_STORYBOOK_IGNORED_STORIES = JSON.parse(defs.HAPPO_STORYBOOK_IGNORED_STORIES);
let HAPPO_STORYBOOK_CONFIG_FILE = JSON.parse(defs.HAPPO_STORYBOOK_CONFIG_FILE);

assert.ok(HAPPO);
assert.strictEqual(HAPPO_STORYBOOK_CONFIG_FILE, path.join(__dirname, '.storybook-test/config.js'))
assert.strictEqual(HAPPO_STORYBOOK_IGNORED_STORIES.length, 0);


// Switch to .storybook-test2. This example has a webpack config as a function.

configDir = '.storybook-test2';

webpackConfig = subject().customizeWebpackConfig({
  b: 'c',
  plugins: [],
  module: {
    rules: [],
  },
});
assert.strictEqual(webpackConfig.b, 'c');
assert.strictEqual(webpackConfig.module.rules.length, 4);
assert.strictEqual(webpackConfig.module.rules[3], 'rule2');
