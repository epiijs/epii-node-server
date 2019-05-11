const vm = require('vm');

/**
 * sandbox for epii server
 *
 * @param {Object=} config
 * @param {Object=} plugin
 */
module.exports = function (config, plugin) {
  return vm.runInNewContext(
    'require("./source/")(config, plugin)',
    { require, config, plugin }
  );
};
