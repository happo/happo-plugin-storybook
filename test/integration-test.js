const happoDomRunner = require('happo.io/build/domRunner').default;
const happoDefaultConfig = require('happo.io/build/DEFAULTS');
const happoPluginStorybook = require('..');

jest.setTimeout(20000);

let subject;
let happoConfig;
let configDir;

beforeEach(() => {
  configDir = '.storybook-test-extensive';
  happoConfig = {
    plugins: [happoPluginStorybook({ configDir })],
  };
  subject = () => happoDomRunner({ ...happoDefaultConfig, ...happoConfig }, {});
});

it('works', async () => {
  const result = await subject();
});
