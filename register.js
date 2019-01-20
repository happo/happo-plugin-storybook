import ReactDOM from 'react-dom';

import { getStorybook } from '@storybook/react';

const ASYNC_TIMEOUT = 100;

let examples;
let currentIndex = 0;
let rootElement;
let defaultDelay;

async function waitForContent(elem, start = new Date().getTime(), attempt = 0) {
  const html = elem.innerHTML.trim();
  const duration = new Date().getTime() - start;
  if (html === '' && duration < ASYNC_TIMEOUT) {
    return new Promise(resolve =>
      setTimeout(() => resolve(waitForContent(elem, start, attempt + 1)), 10),
    );
  }
  return html;
}

function getExamples() {
  const storyStore = __STORYBOOK_CLIENT_API__._storyStore;
  const result = [];
  for (let story of getStorybook()) {
    const component = story.kind;
    for (let example of story.stories) {
      const { name: variant, render } = example;
      let delay = defaultDelay;
      if (storyStore.getStoryAndParameters) {
        const { parameters: { happo = {} } } =
          storyStore.getStoryAndParameters(story.kind, variant);
        delay = happo.delay || defaultDelay;
      }

      result.push({
        component,
        variant,
        render,
        delay,
      });
    }
  }
  return result;
};

function init() {
  examples = getExamples();
  document.body.innerHTML = '';
  rootElement = document.createElement('div');
  rootElement.setAttribute('data-happo-ignore', 'true');
  document.body.appendChild(rootElement);
}

window.happo = {};

window.happo.nextExample = async () => {
  if (!examples) init();
  if (currentIndex >= examples.length) {
    return;
  }
  ReactDOM.unmountComponentAtNode(rootElement);
  const { component, variant, render, delay } = examples[currentIndex];
  try {
    ReactDOM.render(render(), rootElement);
    await waitForContent(rootElement);
    await new Promise((resolve) => setTimeout(resolve, delay));
    currentIndex++;
    return { component, variant };
  } catch (e) {
    throw new Error(`Failed to render ${component} - ${variant}: ${e.message}`);
  }
};

export const setDefaultDelay = (delay) => { defaultDelay = delay };
export const isHappoRun = () => window.top === window.self;
