const { getStorybook } = require('@storybook/react');

try {
  addons = require('@storybook/addons').default;
  // Create a mock addons channel to prevent errors during execution.
  addons.setChannel({
    emit: () => null,
    on: () => null,
  });
} catch (e) {
  // ignore - there's a chance the user doesn't have any addons
}

require('.storybook/config.js');

const examples = getStorybook().map(story => {
  const variants = {};
  story.stories.forEach(({ name, render }) => (variants[name] = render));
  return {
    component: story.kind,
    variants,
  };
});

module.exports = examples;

