import storybookClient from '@storybook/core/client';

const time = window.happoTime || {
  originalDateNow: Date.now,
  originalSetTimeout: window.setTimeout.bind(window),
};

const ASYNC_TIMEOUT = 100;
const WAIT_FOR_TIMEOUT = 2000;

let examples;
let currentIndex = 0;
let defaultDelay;

async function waitForSomeContent(elem, start = time.originalDateNow()) {
  const html = elem.innerHTML.trim();
  const duration = time.originalDateNow() - start;
  if (html === '' && duration < ASYNC_TIMEOUT) {
    return new Promise(resolve =>
      time.originalSetTimeout(
        () => resolve(waitForSomeContent(elem, start)),
        10,
      ),
    );
  }
  return html;
}

async function waitForWaitFor(waitFor, start = time.originalDateNow()) {
  const duration = time.originalDateNow() - start;
  if (!waitFor() && duration < WAIT_FOR_TIMEOUT) {
    return new Promise(resolve =>
      time.originalSetTimeout(
        () => resolve(waitForWaitFor(waitFor, start)),
        50,
      ),
    );
  }
}

function getExamples() {
  const storyStore = __STORYBOOK_CLIENT_API__._storyStore;
  if (storyStore.extract) {
    return Object.values(storyStore.extract())
      .map(({ id, kind, story, parameters }) => {
        if (parameters.happo === false) {
          return;
        }
        let delay = defaultDelay;
        let waitForContent;
        let waitFor;
        if (typeof parameters.happo === 'object' && parameters.happo !== null) {
          delay = parameters.happo.delay || defaultDelay;
          waitForContent = parameters.happo.waitForContent;
          waitFor = parameters.happo.waitFor;
        }
        return {
          component: kind,
          variant: story,
          storyId: id,
          delay,
          waitForContent,
          waitFor,
        };
      })
      .filter(Boolean);
  }

  const result = [];

  for (let story of __STORYBOOK_CLIENT_API__.getStorybook()) {
    const component = story.kind;
    for (let example of story.stories) {
      const { name: variant } = example;
      let delay = defaultDelay;
      let waitForContent;
      let waitFor;
      if (storyStore.getStoryAndParameters) {
        const { parameters } = storyStore.getStoryAndParameters(
          story.kind,
          variant,
        );
        if (parameters.happo === false) {
          continue;
        }
        if (typeof parameters.happo === 'object' && parameters.happo !== null) {
          delay = parameters.happo.delay || defaultDelay;
          waitForContent = parameters.happo.waitForContent;
          waitFor = parameters.happo.waitFor;
        }
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
        waitForContent,
        waitFor,
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
  const { component, variant, storyId, delay, waitForContent, waitFor } = examples[
    currentIndex
  ];

  try {
    const docsRootElement = document.getElementById('docs-root');
    if (docsRootElement) {
      docsRootElement.setAttribute('data-happo-ignore', 'true');
    }
    const rootElement = document.getElementById('root');
    rootElement.setAttribute('data-happo-ignore', 'true');
    __STORYBOOK_ADDONS_CHANNEL__.emit('setCurrentStory', {
      kind: component,
      story: variant,
      storyId,
    });
    await new Promise(resolve => time.originalSetTimeout(resolve, 0));
    await waitForSomeContent(rootElement);
    if (/sb-show-errordisplay/.test(document.body.className)) {
      // It's possible that the error is from unmounting the previous story. We
      // can try re-rendering in this case.
      __STORYBOOK_ADDONS_CHANNEL__.emit('forceReRender');
      await waitForSomeContent(rootElement);
    }
    await new Promise(resolve => time.originalSetTimeout(resolve, delay));
    if (waitFor) {
      await waitForWaitFor(waitFor);
    }
    return { component, variant, waitForContent };
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
