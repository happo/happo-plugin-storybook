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

async function getExamples() {
  const storyStore = window.__STORYBOOK_CLIENT_API__._storyStore;
  if (storyStore.extract) {
    if (storyStore.cacheAllCSFFiles) {
      await storyStore.cacheAllCSFFiles();
    }
    return Object.values(storyStore.extract())
      .map(({ id, kind, story, parameters }) => {
        if (parameters.happo === false) {
          return;
        }
        let delay = defaultDelay;
        let waitForContent;
        let waitFor;
        let beforeScreenshot;
        let afterScreenshot;
        let targets;
        if (typeof parameters.happo === 'object' && parameters.happo !== null) {
          delay = parameters.happo.delay || defaultDelay;
          waitForContent = parameters.happo.waitForContent;
          waitFor = parameters.happo.waitFor;
          beforeScreenshot = parameters.happo.beforeScreenshot;
          afterScreenshot = parameters.happo.afterScreenshot;
          targets = parameters.happo.targets;
        }
        return {
          component: kind,
          variant: story,
          storyId: id,
          delay,
          waitForContent,
          waitFor,
          beforeScreenshot,
          afterScreenshot,
          targets,
        };
      })
      .filter(Boolean);
  }

  const result = [];

  for (let story of window.__STORYBOOK_CLIENT_API__.getStorybook()) {
    const component = story.kind;
    for (let example of story.stories) {
      const { name: variant } = example;
      let delay = defaultDelay;
      let waitForContent;
      let waitFor;
      let targets;
      let beforeScreenshot;
      let afterScreenshot;
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
          beforeScreenshot = parameters.happo.beforeScreenshot;
          afterScreenshot = parameters.happo.afterScreenshot;
          targets = parameters.happo.targets;
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
        beforeScreenshot,
        afterScreenshot,
        targets,
      });
    }
  }
  return result;
}

function filterExamples(all) {
  if (initConfig.chunk) {
    const examplesPerChunk = Math.ceil(
      all.length / initConfig.chunk.total,
    );
    const startIndex = initConfig.chunk.index * examplesPerChunk;
    const endIndex = startIndex + examplesPerChunk;
    all = all.slice(startIndex, endIndex);
  }
  if (initConfig.targetName) {
    all = all.filter(e => {
      if (!e.targets || !Array.isArray(e.targets)) {
        // This story hasn't been filtered for specific targets
        return true;
      }
      return e.targets.includes(initConfig.targetName);
    });
  }
  return all;
}

let initConfig = {};

window.happo = {};

window.happo.init = (config) => {
  initConfig = config;
};

window.happo.nextExample = async () => {
  if (!examples) {
    examples = filterExamples(await getExamples());
  }
  if (currentIndex >= examples.length) {
    return;
  }
  const {
    component,
    variant,
    storyId,
    delay,
    waitForContent,
    waitFor,
    beforeScreenshot,
  } = examples[currentIndex];

  try {
    const docsRootElement = document.getElementById('docs-root');
    if (docsRootElement) {
      docsRootElement.setAttribute('data-happo-ignore', 'true');
    }
    const rootElement = document.getElementById('root');
    rootElement.setAttribute('data-happo-ignore', 'true');

    const { afterScreenshot } = examples[currentIndex - 1] || {};
    if (typeof afterScreenshot === 'function') {
      try {
        afterScreenshot({ rootElement });
      } catch (e) {
        console.error('Failed to invoke afterScreenshot hook', e);
      }
    }
    window.__STORYBOOK_ADDONS_CHANNEL__.emit('setCurrentStory', {
      kind: component,
      story: variant,
      storyId,
    });
    await new Promise(resolve => time.originalSetTimeout(resolve, 0));
    await waitForSomeContent(rootElement);
    if (/sb-show-errordisplay/.test(document.body.className)) {
      // It's possible that the error is from unmounting the previous story. We
      // can try re-rendering in this case.
      window.__STORYBOOK_ADDONS_CHANNEL__.emit('forceReRender');
      await waitForSomeContent(rootElement);
    }
    await new Promise(resolve => time.originalSetTimeout(resolve, delay));
    if (waitFor) {
      await waitForWaitFor(waitFor);
    }
    if (beforeScreenshot && typeof beforeScreenshot === 'function') {
      try {
        beforeScreenshot({ rootElement });
      } catch (e) {
        console.error('Failed to invoke beforeScreenshot hook', e);
      }
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
