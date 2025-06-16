import { setThemeSwitcher, setRenderTimeoutMs } from '../register';
import happoDecorator from '../src/decorator';

setThemeSwitcher(async (theme) => {
  // Make sure that it can be async
  await new Promise((r) => setTimeout(r, 100));

  document.body.style = `background-color: ${theme}`;
});

setRenderTimeoutMs(4000);

export default {
  parameters: {
    happo: {
      themes: ['white'],
    },
  },
};

export const decorators = [happoDecorator];
