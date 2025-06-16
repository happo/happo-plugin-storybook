import React, { useEffect } from 'react';
import { addons, makeDecorator } from 'storybook/preview-api';

const { SB_ROOT_ELEMENT_SELECTOR } = require('./constants');

function HappoDecorator({ params, children }) {
  useEffect(() => {
    if (!params) return;

    const channel = addons.getChannel();
    function listen({ funcName }) {
      const rootElement = document.querySelector(SB_ROOT_ELEMENT_SELECTOR);
      if (params[funcName] && typeof params[funcName] === 'function') {
        params[funcName]({ rootElement });
      } else {
        console.warn(`Happo function ${funcName} not found.`);
      }
    }

    channel.on('happo-event', listen);
    return () => {
      channel.off('happo-event', listen);
    };
  }, [params]);

  return children;
}

export const withHappo = makeDecorator({
  name: 'withHappo',
  parameterName: 'happo',
  wrapper: (Story, context) => {
    return (
      <HappoDecorator params={context.parameters.happo}>
        <Story />
      </HappoDecorator>
    );
  },
});

export default withHappo;
