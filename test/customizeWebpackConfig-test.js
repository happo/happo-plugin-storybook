const assert = require('assert');
const path = require('path');
const fs = require('fs');

const constructPlugin = require('../');

let subject;
let webpackConfig;
let configDir;

beforeEach(() => {
  configDir = '.storybook-test';
  webpackConfig = {
    a: 'b',
    plugins: [],
    module: {
      rules: [],
    },
  };
  subject = () =>
    constructPlugin({
      configDir,
    }).customizeWebpackConfig(webpackConfig);
});

it('creates the right webpack config', () => {
  const config = subject();
  expect(config.a).toEqual('b');
  expect(config.module.rules.length).toEqual(1);
  expect(config.module.rules[0]).toEqual('rule1');
});

it('sets the right definitions', () => {
  const config = subject();
  let defs = config.plugins[0].definitions;
  let HAPPO = JSON.parse(defs.HAPPO);
  let HAPPO_STORYBOOK_IGNORED_STORIES = JSON.parse(
    defs.HAPPO_STORYBOOK_IGNORED_STORIES,
  );
  let HAPPO_STORYBOOK_CONFIG_FILE = JSON.parse(
    defs.HAPPO_STORYBOOK_CONFIG_FILE,
  );

  expect(HAPPO).toBe(true);
  expect(HAPPO_STORYBOOK_CONFIG_FILE).toEqual(
    path.join(process.cwd(), '.storybook-test/config.js'),
  );
  expect(HAPPO_STORYBOOK_IGNORED_STORIES.length).toBe(0);
});

describe('when using full control mode', () => {
  // Switch to .storybook-test2. This example has a webpack config as a function.
  beforeEach(() => {
    configDir = '.storybook-test2';
    webpackConfig = {
      b: 'c',
      plugins: [],
      module: {
        rules: [],
      },
    };
  });

  it('creates the right webpack config', () => {
    const config = subject();
    expect(config.b).toEqual('c');
    expect(config.module.rules.length).toEqual(4);
    expect(config.module.rules[3]).toEqual('rule2');
  });

  it('sets the right definitions', () => {
    const config = subject();
    let defs = config.plugins[0].definitions;
    let HAPPO = JSON.parse(defs.HAPPO);
    let HAPPO_STORYBOOK_IGNORED_STORIES = JSON.parse(
      defs.HAPPO_STORYBOOK_IGNORED_STORIES,
    );
    let HAPPO_STORYBOOK_CONFIG_FILE = JSON.parse(
      defs.HAPPO_STORYBOOK_CONFIG_FILE,
    );

    expect(HAPPO).toBe(true);
    expect(HAPPO_STORYBOOK_CONFIG_FILE).toEqual(
      path.join(process.cwd(), '.storybook-test2/config.js'),
    );
    expect(HAPPO_STORYBOOK_IGNORED_STORIES.length).toBe(0);
  });
});
