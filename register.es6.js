const WAIT_FOR_CONTENT_TIMEOUT = 100;
const WAIT_FOR_XHR_TIMEOUT = 2000;

let examples;
let currentIndex = 0;
let defaultDelay;

let outstandingRequests = 0;
function decreaseOutstandingRequests() {
  outstandingRequests--;
}

const originalXHROpen = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function() {
  console.log('xhr', arguments);
  outstandingRequests++;
  this.addEventListener('loadend', decreaseOutstandingRequests);
  return originalXHROpen.apply(this, arguments);
};

if (window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function() {
    outstandingRequests++;
    console.log('fetch', arguments);
    return originalFetch
      .apply(this, arguments)
      .then(decreaseOutstandingRequests)
      .catch(decreaseOutstandingRequests);
  };
}

async function waitForContent(elem, start = new Date().getTime()) {
  const html = elem.innerHTML.trim();
  const duration = new Date().getTime() - start;
  if (html === '' && duration < WAIT_FOR_CONTENT_TIMEOUT) {
    return new Promise(resolve =>
      setTimeout(() => resolve(waitForContent(elem, start)), 10),
    );
  }
}

async function waitForXHRSilence(start = new Date().getTime()) {
  const duration = new Date().getTime() - start;
  if (outstandingRequests !== 0 && duration < WAIT_FOR_XHR_TIMEOUT) {
    return new Promise(resolve =>
      setTimeout(() => resolve(waitForXHRSilence(start)), 10),
    );
  }
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
    await waitForXHRSilence();
    if (/sb-show-errordisplay/.test(document.body.className)) {
      // It's possible that the error is from unmounting the previous story. We
      // can try re-rendering in this case.
      __STORYBOOK_ADDONS_CHANNEL__.emit('forceReRender');
      await waitForContent(rootElement);
      await waitForXHRSilence();
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
