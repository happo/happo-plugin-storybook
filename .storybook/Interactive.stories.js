import { within, userEvent } from '@storybook/testing-library';
import { useState } from 'react';

const Interactive = () => {
  const [value, setValue] = useState();
  return (
    <div>
      <button onClick={() => setValue(true)}>click me</button>
      {value && <p>I was clicked</p>}
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
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await new Promise((r) => setTimeout(r, 3000));
    await userEvent.click(canvas.getByRole('button'));
  },
};
