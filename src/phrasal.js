const evaluate = (options, config, target, prop) => {
  const { fn, bind = target, path } = config;
  const { key, values: val = [key] } = path[0]; // next
  const values = typeof val === 'function' ? val.bind(bind)(options) : val;
  if (values.includes(prop)) {
    return {
      fn,
      bind,
      path: path.slice(1), // remaining
      options: { ...options, [key]: prop },
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
      const { fn, bind, path: newPath, options: newOptions } = next;
      if (newPath.length) {
        return new Proxy(target, phrasal(newOptions, { fn, bind, path: newPath }));
      }
      return (...args) => fn.bind(bind)(newOptions, ...args);
    }
    if (typeof prop === 'string') {
      throw new Error(`unknown term in phrasal function: ${prop}`);
    }
    return target[prop];
  },
});

module.exports = (target, configs) => new Proxy(target, phrasal({}, configs[0]));
