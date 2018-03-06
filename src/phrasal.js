const evaluate = (options, config, target, prop) => {
  const { fn, bind = target, path } = config;
  const { key, values: val = [key] } = path[0]; // next
  const values = typeof val === 'function' ? val.bind(bind)(options) : val;
  if (values.includes(prop)) {
    const remaining = path.slice(1);
    return {
      fn,
      bind,
      options: { ...options, [key]: prop },
      config: { fn, bind, path: remaining },
      further: remaining.length > 0,
    };
  }
  return false; // no match
};

const phrasal = (options, config) => ({ // TODO: support multiple paths
  get: (target, prop) => { // trap
    if (Object.prototype.hasOwnProperty.call(target, prop)) { // FIXME: do this only on level zero!
      return target[prop];
    }
    const next = evaluate(options, config, target, prop);
    if (next) {
      const { fn, bind, options: newOptions, config: newConfig, further } = next;
      return further
        ? new Proxy(target, phrasal(newOptions, newConfig))
        : (...args) => fn.bind(bind)(newOptions, ...args);
    }
    if (typeof prop === 'string') {
      throw new Error(`unknown term in phrasal function: ${prop}`);
    }
    return target[prop];
  },
});

module.exports = (target, configs) => new Proxy(target, phrasal({}, configs[0]));
