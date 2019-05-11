const _ = require('lodash');
const assist = require('./assist');

const config = {};

/**
 * load app config
 *
 * @param {Object=} conf
 */
assist.internal(config, 'load', (c) => {
  if (!c) return config;
  return _.merge(config, c);
});

module.exports = config;
