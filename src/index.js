const phrasal = require('./phrasal');

module.exports = {
  phrasal: (...configs) => phrasal({}, configs),
  proxy: (target, ...configs) => phrasal(target, configs),
};
