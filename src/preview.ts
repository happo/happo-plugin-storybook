
import { ProjectAnnotations, Renderer } from "@storybook/types";
import { PARAM_KEY } from "./constants";
import { withHappo } from "./withHappo";
import './register'

/**
 * Note: if you want to use JSX in this file, rename it to `preview.tsx`
 * and update the entry prop in tsup.config.ts to use "src/preview.tsx",
 */
const preview: ProjectAnnotations<Renderer> = {
  decorators: [withHappo],
  globals: {
    [PARAM_KEY]: false,
  },
};

export default preview;
