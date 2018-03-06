const phrasal = require('./phrasal');

module.exports = {
  phrasal: (...configs) => phrasal({}, configs),
  proxy: (target, ...config) => phrasal(target, config),
};
