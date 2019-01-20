import ReactDOM from 'react-dom';

import { getStorybook } from '@storybook/react';

const ASYNC_TIMEOUT = 100;

let examples;
let currentIndex = 0;
let rootElement;

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
  const result = [];
  for (let story of getStorybook()) {
    const component = story.kind;
    for (let example of story.stories) {
      const { name: variant, render } = example;
      result.push({
        component,
        variant,
        render,
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
  const { component, variant, render } = examples[currentIndex];
  try {
    ReactDOM.render(render(), rootElement);
    await waitForContent(rootElement);
    currentIndex++;
    return { component, variant };
  } catch (e) {
    throw new Error(`Failed to render ${component} - ${variant}: ${e.message}`);
  }
};
