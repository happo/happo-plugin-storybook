// You can use presets to augment the Storybook configuration
// You rarely want to do this in addons,
// so often you want to delete this file and remove the reference to it in package.json#exports and package.json#bunder.nodeEntries
// Read more about presets at https://storybook.js.org/docs/addons/writing-presets

import { StorybookConfig } from "@storybook/types"

export const viteFinal = async (config: StorybookConfig) => {
  return config
}

export const webpack = async (config: StorybookConfig) => {
  return config
}

// Legacy
export function managerEntries(entry: any[] = []) {
  return [...entry, require.resolve('./legacy/addon')];
}

export function config(entry: any[] = []) {
  return [...entry, require.resolve('./legacy/decorator')];
}