const _ = require('lodash')
const assist = require('./assist')

var config = {}

/**
 * load app config
 *
 * @param {Object=} conf
 **/
assist.internal(config, 'load', function load(conf) {
  if (!conf) return config
  return _.merge(config, conf)
})

module.exports = config
