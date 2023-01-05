function managerEntries(entry = []) {
  return [...entry, require.resolve("./addon")]; //👈 Addon implementation
}

module.exports = { managerEntries }
