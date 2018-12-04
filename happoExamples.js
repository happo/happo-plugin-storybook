// Storybook needs a root element on startup
const root = document.createElement('div');
root.setAttribute('id', 'root');
document.body.appendChild(root);

// Without these history overrides, happo runs that use happo-plugin-puppeteer
// fail.
window.history.replaceState = () => {};
window.history.pushState = () => {};

const { getStorybook } = require('@storybook/react');

try {
  const addons = require('@storybook/addons').default;
  // Create a mock addons channel to prevent errors during execution.
  addons.setChannel({
    emit: () => null,
    on: () => null,
    once: () => null,
    removeListener: () => null,
    removeAllListeners: () => null,
    prependOnceListener: () => null,
    prependListener: () => null,
    addListener: () => null,
    addPeerListener: () => null,
    addPeerListener: () => null,
    eventNames: () => [],
    listenerCount: () => 0,
    listeners: () => [],
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
  story.stories.forEach(({ name, render }) => (variants[name] = (renderInDom) => {
    renderInDom(render());
    return new Promise((resolve) => setTimeout(resolve, 0));
  }));

  return {
    component: story.kind,
    variants,
  };
}).filter(Boolean);

module.exports = examples;

