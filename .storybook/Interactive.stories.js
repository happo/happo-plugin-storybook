import { within, userEvent, expect } from 'storybook/test';
import React, { useState } from 'react';
import { forceHappoScreenshot } from '../register';

const Interactive = () => {
  const [value, setValue] = useState();
  return (
    <div>
      <button onClick={() => setValue((old) => !old)}>click me</button>
      {value && <p>I was clicked</p>}
      {!value && <p>I was not clicked</p>}
    </div>
  );
};

export default {
  title: 'Interactive',
  component: Interactive,
  argTypes: {
    onClick: { action: true },
  },
  parameters: {
    happo: {
      axeOptions: { rules: { 'color-contrast': { enabled: false } } },
    },
  },
};

export const Demo = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await new Promise((r) => setTimeout(r, 3000));

    await step('clicked', async () => {
      console.log(args);
      await userEvent.click(canvas.getByRole('button'));
      await expect(canvas.getByText('I was clicked')).toBeInTheDocument();
      await forceHappoScreenshot('clicked');
    });

    await step('second click', async () => {
      await userEvent.click(canvas.getByRole('button'));
      await expect(canvas.getByText('I was not clicked')).toBeInTheDocument();
      await forceHappoScreenshot('second click');
    });
  },

  beforeEach: () => {
    // Add afterEach hook for waiting and logging between tests
    return async () => {
      console.log('Test completed, waiting 500ms before next test...');
      await new Promise((resolve) => setTimeout(resolve, 500));
    };
  },
};

export const InteractiveThrowsError = {
  // This story exists to test what happens when the play function throws an
  // error that isn't caused by `forceHappoScreenshot`.
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await new Promise((r) => setTimeout(r, 200));

    await step('clicked', async () => {
      await userEvent.click(canvas.getByRole('button'));
      await expect(canvas.getByText('I was clicked')).toBeInTheDocument();
      await forceHappoScreenshot('clicked');
      throw new Error('Whoops');

      // We will never reach this line
      await forceHappoScreenshot('clicked2');
    });
  },
};
