const ASYNC_TIMEOUT = 100;

let examples;
let currentIndex = 0;
let defaultDelay;

async function waitForContent(elem, start = new Date().getTime()) {
  const html = elem.innerHTML.trim();
  const duration = new Date().getTime() - start;
  if (html === '' && duration < ASYNC_TIMEOUT) {
    return new Promise(resolve =>
      setTimeout(() => resolve(waitForContent(elem, start)), 10),
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

      result.push({
        component,
        variant,
        delay,
      });
    }
  }
  return result;
}

function cleanDocument() {
  const snapBox = document.getElementById('__snapshot-box');
  if (!snapBox) {
    return;
  }
  document.body.removeChild(snapBox);
}

window.happo = {};

window.happo.initChunk = ({ index, total }) => {
  const all = getExamples();
  const examplesPerChunk = Math.ceil(all.length / total);
  const startIndex = index * examplesPerChunk;
  const endIndex = startIndex + examplesPerChunk;
  examples = all.slice(startIndex, endIndex);
}

window.happo.nextExample = async () => {
  if (!examples) {
    examples = getExamples();
  }
  if (currentIndex >= examples.length) {
    return;
  }
  const { component, variant, delay } = examples[currentIndex];

  try {
    cleanDocument();
    const rootElement = document.getElementById('root');
    rootElement.setAttribute('data-happo-ignore', 'true');
    __STORYBOOK_ADDONS_CHANNEL__.emit('setCurrentStory', {
      kind: component,
      story: variant,
    });
    await waitForContent(rootElement);
    if (/sb-show-errordisplay/.test(document.body.className)) {
      // It's possible that the error is from unmounting the previous story. We
      // can try re-rendering in this case.
      __STORYBOOK_ADDONS_CHANNEL__.emit('forceReRender');
      await waitForContent(rootElement);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
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
