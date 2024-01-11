import { makeDecorator, addons } from '@storybook/preview-api';
import { useEffect } from 'react';

const { SB_ROOT_ELEMENT_SELECTOR } = require('./constants');

const withHappo = makeDecorator({
  name: 'withHappo',
  parameterName: 'happo',
  wrapper: (storyFn, context, { parameters }) => {
    useEffect(() => {
      const channel = addons.getChannel();
      function listen({ funcName }) {
        const rootElement = document.querySelector(SB_ROOT_ELEMENT_SELECTOR);
        parameters[funcName]({ rootElement });
      }
      channel.on('happo-event', listen);
      return () => channel.off('happo-event', listen);
    }, []);
    return storyFn(context);
  },
});

export const decorators = [withHappo];
