import storybookClient from '@storybook/core/client';

const time = window.happoTime || {
  originalDateNow: Date.now,
  originalSetTimeout: window.setTimeout.bind(window),
};

const ASYNC_TIMEOUT = 100;

let examples;
let currentIndex = 0;
let defaultDelay;

async function waitForContent(elem, start = time.originalDateNow()) {
  const html = elem.innerHTML.trim();
  const duration = time.originalDateNow() - start;
  if (html === '' && duration < ASYNC_TIMEOUT) {
    return new Promise(resolve =>
      time.originalSetTimeout(() => resolve(waitForContent(elem, start)), 10),
    );
  }
  return html;
}

function getExamples() {
  const storyStore = __STORYBOOK_CLIENT_API__._storyStore;
  const result = [];
  for (let story of __STORYBOOK_CLIENT_API__.getStorybook()) {
    const component = story.kind;
    for (let example of story.stories) {
      const { name: variant } = example;
      let delay = defaultDelay;
      if (storyStore.getStoryAndParameters) {
        const {
          parameters: { happo = {} },
        } = storyStore.getStoryAndParameters(story.kind, variant);
        delay = happo.delay || defaultDelay;
      }

      const storyId = (storybookClient.toId || (() => undefined))(
        story.kind,
        variant,
      );

      result.push({
        component,
        variant,
        delay,
        storyId,
      });
    }
  }
  return result;
}

window.happo = {};

window.happo.initChunk = ({ index, total }) => {
  const all = getExamples();
  const examplesPerChunk = Math.ceil(all.length / total);
  const startIndex = index * examplesPerChunk;
  const endIndex = startIndex + examplesPerChunk;
  examples = all.slice(startIndex, endIndex);
};

window.happo.nextExample = async () => {
  if (!examples) {
    examples = getExamples();
  }
  if (currentIndex >= examples.length) {
    return;
  }
  const { component, variant, storyId, delay } = examples[currentIndex];

  try {
    const rootElement = document.getElementById('root');
    rootElement.setAttribute('data-happo-ignore', 'true');
    __STORYBOOK_ADDONS_CHANNEL__.emit('setCurrentStory', {
      kind: component,
      story: variant,
      storyId,
    });
    await new Promise(resolve => time.originalSetTimeout(resolve, 0));
    await waitForContent(rootElement);
    if (/sb-show-errordisplay/.test(document.body.className)) {
      // It's possible that the error is from unmounting the previous story. We
      // can try re-rendering in this case.
      __STORYBOOK_ADDONS_CHANNEL__.emit('forceReRender');
      await waitForContent(rootElement);
    }
    await new Promise(resolve => time.originalSetTimeout(resolve, delay));
    return { component, variant };
  } catch (e) {
    console.warn(e);
    return { component, variant };
  } finally {
    currentIndex++;
  }
};

export const setDefaultDelay = delay => {
  defaultDelay = delay;
};
export const isHappoRun = () => window.__IS_HAPPO_RUN;
