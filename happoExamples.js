module.exports = HAPPO_DATA.examples.map(({ component, variants }) => {
  const newVariants = {};
  Object.keys(variants).forEach((name) => {
    // convert to function
    newVariants[name] = () => document.body.innerHTML = variants[name];
  });
  return {
    component,
    variants: newVariants,
  };
});

