import { within, userEvent, expect } from '@storybook/test';
import React, { useState } from 'react';
import { forceHappoScreenshot } from '../register';

const Interactive = () => {
  const [value, setValue] = useState(false);
  return (
    <div>
      <button onClick={() => setValue(old => !old)}>click me</button>
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
};

export const Demo = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await new Promise((r) => setTimeout(r, 3000));

    await step('clicked', async () => {
      console.log(args);
      await userEvent.click(canvas.getByRole('button'));
      await expect(canvas.getByText('I was clicked')).toBeInTheDocument();
      forceHappoScreenshot('clicked');
    });

    await step('second click', async () => {
      await userEvent.click(canvas.getByRole('button'));
      await expect(canvas.getByText('I was not clicked')).toBeInTheDocument();
      forceHappoScreenshot('second click');
    });
  },
};
