const phrasal = require('./phrasal');

module.exports = {
  phrasal: config => phrasal({}, config),
  proxy: (target, config) => phrasal(target, config),
};
