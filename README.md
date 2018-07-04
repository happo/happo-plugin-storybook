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
