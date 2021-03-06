const getValues = ({ values, bind, options }) => (
  typeof values === 'function' ? values.bind(bind)(options) : values
);

const evaluate = (options, config, target, prop) => {
  const { fn, bind = target, path, floating = [] } = config;
  // 1. next path element
  const { key, values: val = [key] } = path[0]; // next
  const values = getValues({ values: val, bind, options });
  if (values.includes(prop)) {
    const remaining = path.slice(1);
    return {
      fn,
      bind,
      options: { ...options, [key]: prop },
      config: { fn, bind, path: remaining, floating },
      further: remaining.length > 0,
    };
  }
  // 2. floating elements
  const fOption = floating.reduce((acc, { key: fKey, values: fVal = [fKey] }) => {
    if (acc) return acc;
    const fValues = getValues({ values: fVal, bind, options });
    return fValues.includes(prop) ? { [fKey]: prop } : false;
  }, false);
  if (fOption) {
    return {
      fn,
      bind,
      options: { ...options, ...fOption },
      config: { fn, bind, path, floating },
      further: true,
    };
  }
  // 3. no match
  return false;
};

const phrasal = (level, options, configs) => ({
  get: (target, prop) => { // trap
    if (level === 0 && Object.prototype.hasOwnProperty.call(target, prop)) {
      return target[prop];
    }
    for (const config of configs) { // eslint-disable-line no-restricted-syntax
      const next = evaluate(options, config, target, prop);
      if (next) {
        const { fn, bind, options: newOptions, config: newConfig, further } = next;
        return further
          ? new Proxy(target, phrasal(level + 1, newOptions, [newConfig]))
          : (...args) => fn.bind(bind)(newOptions, ...args);
      }
    }
    if (level > 0 && typeof prop === 'string') {
      throw new Error(`unknown word in phrasal function: "${prop}"`);
    }
    return target[prop]; // can be undefined
  },
});

module.exports = (target, configs) => new Proxy(target, phrasal(0, {}, configs));
