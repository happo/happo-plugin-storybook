module.exports = (baseConfig, mode, defaultConfig) => {
  const clone = Object.assign({}, baseConfig);
  clone.module.rules.push('rule2');
  return clone;
}
