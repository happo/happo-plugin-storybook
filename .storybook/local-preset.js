/**
 * to load the built addon in this test Storybook
 */
async function previewAnnotations(entry = []) {
  return [...entry, require.resolve("../dist/preview.js")];
}

async function managerEntries(entry = []) {
  return [...entry, require.resolve("../dist/manager.js")];
}

export default {
  managerEntries,
  previewAnnotations,
};