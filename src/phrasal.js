const phrasal = (options, config) => ({
  get: (target, prop) => { // trap
    if (Object.prototype.hasOwnProperty.call(target, prop)) { // FIXME: do this only on level zero!
      return target[prop];
    }
    const { fn, bind = target, path } = config; // TODO: add multiple paths
    const { key, values: val = [key] } = path[0];
    const values = typeof val === 'function' ? val.bind(bind)(options) : val;
    if (values.includes(prop)) {
      const remaining = path.slice(1);
      if (!remaining.length) {
        return (...args) => fn.bind(bind)({ ...options, [key]: prop }, ...args);
      }
      return new Proxy(target, phrasal(
        { ...options, [key]: prop },
        { fn, bind, path: remaining }
      ));
    }
    return target[prop];
  },
});

module.exports = (target, config) => new Proxy(target, phrasal({}, config));
