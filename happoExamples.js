const { getStorybook } = require('@storybook/react');

try {
  const addons = require('@storybook/addons').default;
  // Create a mock addons channel to prevent errors during execution.
  addons.setChannel({
    emit: () => null,
    on: () => null,
  });
} catch (e) {
  // ignore - there's a chance the user doesn't have any addons
}

require(HAPPO_STORYBOOK_CONFIG_FILE);

const examples = getStorybook().map(story => {
  if (HAPPO_STORYBOOK_IGNORED_STORIES.includes(story.kind)) {
    return;
  }
  const variants = {};
  story.stories.forEach(({ name, render }) => (variants[name] = render));
  return {
    component: story.kind,
    variants,
  };
}).filter(Boolean);

module.exports = examples;

