import { setThemeSwitcher } from '../register';

setThemeSwitcher(async (theme, channel) => {
  // Make sure that it can be async
  await new Promise(r => setTimeout(r, 100));

  document.body.style = `background-color: ${theme}`;
});

