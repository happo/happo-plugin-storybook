import { setThemeSwitcher, setRenderTimeoutMs } from '../register';
import React, { useCallback, useEffect } from 'react';

import { useGlobals } from '@storybook/addons';

import { addons } from '@storybook/preview-api';
import { EVENTS } from './constants';

setThemeSwitcher(async (theme, channel) => {
  // Make sure that it can be async
  await new Promise((r) => setTimeout(r, 100));

  if (theme.startsWith('locale:')) {
    channel.emit(EVENTS.SWITCH_LOCALE, theme.slice(7, 9));
    document.body.style = 'background-color: white';
  } else {
    channel.emit(EVENTS.SWITCH_LOCALE, 'en');
    document.body.style = `background-color: ${theme}`;
  }
});

setRenderTimeoutMs(4000);

function LocaleController({ children }) {}

export default {
  parameters: {
    happo: {
      themes: ['white', 'locale:sv'],
    },
  },
  globalTypes: {
    locale: {
      description: 'Locales',
      defaultValue: 'en',
      toolbar: {
        // The label to show for this toolbar item
        title: 'Locale',
        icon: 'cpu',
        // Array of plain string values or MenuItem shape (see below)
        items: ['en', 'sv'],
        // Change title based on selected value
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const [{ locale }, updateGlobals] = useGlobals();
      console.log('Current locale', locale);

      const channel = addons.getChannel();

      useEffect(() => {
        const handleLocaleSwitch = (newLocale) => {
          updateGlobals({ locale: newLocale });
        };

        channel.on(EVENTS.SWITCH_LOCALE, handleLocaleSwitch);

        return () => {
          channel.off(EVENTS.SWITCH_LOCALE, handleLocaleSwitch);
        };
      }, [locale, updateGlobals, channel]);

      return <Story {...context} />;
    },
  ],
};
