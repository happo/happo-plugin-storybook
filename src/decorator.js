import { useEffect } from 'react';
import { makeDecorator, addons } from '@storybook/addons';

const withHappo = makeDecorator({
  name: 'withHappo',
  parameterName: 'happo',
  wrapper: (storyFn, context, { parameters }) => {
    useEffect(() => {
      const channel = addons.getChannel();
      function listen({ funcName }) {
        const rootElement = document.getElementById('root');
        parameters[funcName]({ rootElement });
      }
      channel.on('happo-event', listen);
      return () => channel.off('happo-event', listen);
    }, []);
    return storyFn(context);
  },
});

export const decorators = [withHappo];
