# happo-plugin-storybook

A [happo.io](https://github.com/enduire/happo.io) plugin for Storybook.

## Usage

Add the following to your `.happo.js` configuration file:

```js
// .happo.js
const happoPluginStorybook = require('happo-plugin-storybook');

module.exports = {
  // ...
  plugins: [
    happoPluginStorybook({
      // options go here
    }),
  ],
}
```

## Options

- `configDir` specify the name of the Storybook configuration directory. The
  default is `.storybook`.
- `ignoredStories` an array of story names that you want to exclude from the
  Happo test suite. The default is an empty array `[]`.

Additionally, if you want to have better control over what addons and/or
decorators get loaded you can look for a global `HAPPO` variable in your
Storybook config. E.g.

```js
// .storybook/config.js

const isHappoRun = typeof HAPPO !== 'undefined';

if (!isHappoRun) {
  // load some addons/decorators that happo won't use
} else {
  // load some addons/decorators that happo will use
}
```

