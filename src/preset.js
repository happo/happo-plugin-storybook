function managerEntries(entry = []) {
  return [...entry, require.resolve('./addon')];
}

function config(entry = []) {
  return [...entry, require.resolve('./preview')];
}

module.exports = { managerEntries, config };
