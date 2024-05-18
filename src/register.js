const { SB_ROOT_ELEMENT_SELECTOR } = require('./constants');

const time = window.happoTime || {
  originalDateNow: Date.now,
  originalSetTimeout: window.setTimeout.bind(window),
};

const ASYNC_TIMEOUT = 100;

let renderTimeoutMs = 2000;
let examples;
let currentIndex = 0;
let defaultDelay;
let themeSwitcher;
let forcedHappoScreenshotSteps;
let shouldWaitForCompletedEvent = true;

async function waitForSomeContent(elem, start = time.originalDateNow()) {
  const html = elem.innerHTML.trim();
  const duration = time.originalDateNow() - start;
  if (html === '' && duration < ASYNC_TIMEOUT) {
    return new Promise((resolve) =>
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
  if (!waitFor() && duration < renderTimeoutMs) {
    return new Promise((resolve) =>
      time.originalSetTimeout(
        () => resolve(waitForWaitFor(waitFor, start)),
        50,
      ),
    );
  }
}

async function getExamples() {
  const storyStore = window.__STORYBOOK_CLIENT_API__
    ? window.__STORYBOOK_CLIENT_API__._storyStore
    : window.__STORYBOOK_PREVIEW__.storyStoreValue;

  if (!storyStore.extract) {
    throw new Error('Missing Storybook Client API');
  }
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
      let themes;
      if (typeof parameters.happo === 'object' && parameters.happo !== null) {
        delay = parameters.happo.delay || defaultDelay;
        waitForContent = parameters.happo.waitForContent;
        waitFor = parameters.happo.waitFor;
        beforeScreenshot = parameters.happo.beforeScreenshot;
        afterScreenshot = parameters.happo.afterScreenshot;
        targets = parameters.happo.targets;
        themes = parameters.happo.themes;
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
        themes,
      };
    })
    .filter(Boolean)
    .reduce((result, { themes, ...rest }) => {
      if (!themes) {
        result.push(rest);
      } else {
        themes.forEach((theme) => {
          result.push({
            ...rest,
            variant: `${rest.variant} [${theme}]`,
            theme,
          });
        });
      }

      return result;
    }, [])
    .sort((a, b) => {
      const aCompare = `${a.theme}-${a.storyId}`;
      const bCompare = `${b.theme}-${b.storyId}`;
      if (aCompare === bCompare) {
        return 0;
      }
      return aCompare < bCompare ? -1 : 1;
    });
}

function filterExamples(all) {
  if (initConfig.chunk) {
    const examplesPerChunk = Math.ceil(all.length / initConfig.chunk.total);
    const startIndex = initConfig.chunk.index * examplesPerChunk;
    const endIndex = startIndex + examplesPerChunk;
    all = all.slice(startIndex, endIndex);
  }
  if (initConfig.targetName) {
    all = all.filter((e) => {
      if (!e.targets || !Array.isArray(e.targets)) {
        // This story hasn't been filtered for specific targets
        return true;
      }
      return e.targets.includes(initConfig.targetName);
    });
  }
  if (initConfig.only) {
    all = all.filter(
      (e) =>
        e.component === initConfig.only.component &&
        e.variant === initConfig.only.variant,
    );
  }
  return all;
}

let initConfig = {};

window.happo = {};

window.happo.init = (config) => {
  initConfig = config;
};

function renderStory(story, { force = false } = {}) {
  const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
  let isPlaying = false;
  return new Promise((resolve) => {
    const timeout = time.originalSetTimeout(resolve, renderTimeoutMs);
    function handleRenderPhaseChanged(ev) {
      console.log(ev);
      if (ev.newPhase === 'completed') {
        channel.off('storyRenderPhaseChanged', handleRenderPhaseChanged);
        clearTimeout(timeout);
        return resolve();
      }
      if (
        ev.newPhase === 'errored' &&
        isPlaying &&
        forcedHappoScreenshotSteps
      ) {
        channel.off('storyRenderPhaseChanged', handleRenderPhaseChanged);
        clearTimeout(timeout);
        const pausedAtStep =
          forcedHappoScreenshotSteps[forcedHappoScreenshotSteps.length - 1];
        if (pausedAtStep.done) {
          // Already processed this step
          return resolve();
        }
        return resolve({
          pausedAtStep,
        });
      }
      if (ev.newPhase === 'playing') {
        isPlaying = true;
      }
    }

    if (shouldWaitForCompletedEvent) {
      channel.on('storyRenderPhaseChanged', handleRenderPhaseChanged);
    }
    if (force) {
      channel.emit('forceRemount', story);
    } else {
      channel.emit('setCurrentStory', story);
    }
    if (!shouldWaitForCompletedEvent) {
      time.originalSetTimeout(() => {
        clearTimeout(timeout);
        resolve();
      }, 0);
    }
  });
}

window.happo.nextExample = async () => {
  if (!examples) {
    examples = filterExamples(await getExamples());
  }
  if (currentIndex >= examples.length) {
    return;
  }
  const {
    component,
    variant: rawVariant,
    storyId,
    delay,
    waitForContent,
    waitFor,
    beforeScreenshot,
    theme,
  } = examples[currentIndex];

  let pausedAtStep;
  let variant = rawVariant;

  try {
    if (
      window.happoSkipped &&
      window.happoSkipped.some(
        (item) => item.component === component && item.variant === variant,
      )
    ) {
      console.log(
        `Skipping ${component}, ${variant} since it is in the skip list`,
      );
      return { component, variant, skipped: true };
    }

    const docsRootElement = document.getElementById('docs-root');
    if (docsRootElement) {
      docsRootElement.setAttribute('data-happo-ignore', 'true');
    }
    const rootElement = document.querySelector(SB_ROOT_ELEMENT_SELECTOR);
    rootElement.setAttribute('data-happo-ignore', 'true');

    const { afterScreenshot } = examples[currentIndex - 1] || {};
    if (typeof afterScreenshot === 'function') {
      try {
        await afterScreenshot({ rootElement });
      } catch (e) {
        console.error('Failed to invoke afterScreenshot hook', e);
      }
    }
    const renderResult =
      (await renderStory(
        {
          kind: component,
          story: rawVariant,
          storyId,
        },
        { force: !!forcedHappoScreenshotSteps },
      )) || {};
    pausedAtStep = renderResult.pausedAtStep;
    if (pausedAtStep) {
      variant = `${variant}-${pausedAtStep.stepLabel}`;
    } else {
      forcedHappoScreenshotSteps = undefined;
    }

    if (theme && themeSwitcher) {
      await themeSwitcher(theme, window.__STORYBOOK_ADDONS_CHANNEL__);
    }
    await waitForSomeContent(rootElement);
    if (/sb-show-errordisplay/.test(document.body.className)) {
      // It's possible that the error is from unmounting the previous story. We
      // can try re-rendering in this case.
      window.__STORYBOOK_ADDONS_CHANNEL__.emit('forceReRender');
      await waitForSomeContent(rootElement);
    }
    if (beforeScreenshot && typeof beforeScreenshot === 'function') {
      try {
        await beforeScreenshot({ rootElement });
      } catch (e) {
        console.error('Failed to invoke beforeScreenshot hook', e);
      }
    }
    await new Promise((resolve) => time.originalSetTimeout(resolve, delay));
    if (waitFor) {
      await waitForWaitFor(waitFor);
    }
    return { component, variant, waitForContent };
  } catch (e) {
    console.warn(e);
    return { component, variant };
  } finally {
    if (!pausedAtStep) {
      currentIndex++;
    } else {
      pausedAtStep.done = true;
    }
  }
};

export function forceHappoScreenshot(stepLabel) {
  if (!currentIndex) {
    console.log(
      `Ignoring forceHappoScreenshot with step label "${stepLabel}" since we are not currently rendering for Happo`,
    );
    return;
  }
  if (!stepLabel) {
    throw new Error(
      'Missing stepLabel argument. Make sure to pass a string as the first argument to this function. E.g. `forceHappoScreenshot("modal open")`',
    );
  }

  if (
    forcedHappoScreenshotSteps &&
    forcedHappoScreenshotSteps.some((s) => s.stepLabel === stepLabel)
  ) {
    // ignore, this step has already been handled
    return;
  }

  forcedHappoScreenshotSteps = forcedHappoScreenshotSteps || [];
  forcedHappoScreenshotSteps.push({ stepLabel, done: false });

  const e = new Error(`Forced screenshot with label "${stepLabel}"`);
  e.type = 'ForcedHappoScreenshot';
  e.step = stepLabel;
  console.log('Forcing happo screenshot', stepLabel);
  throw e;
}

export function setDefaultDelay(delay) {
  defaultDelay = delay;
}
export function setRenderTimeoutMs(timeoutMs) {
  renderTimeoutMs = timeoutMs;
}
export function setThemeSwitcher(func) {
  themeSwitcher = func;
}
export function setShouldWaitForCompletedEvent(swfce) {
  shouldWaitForCompletedEvent = swfce;
}
export const isHappoRun = () => window.__IS_HAPPO_RUN;
