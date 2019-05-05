let chalk
try {
  chalk = require('chalk')
} catch (error) {}

const LOGO = chalk ? 'EPII Server' : '[EPII] Server'
const TYPE = {
  info: 'blue',
  warn: 'yellow',
  halt: 'red',
  done: 'green'
}
const TYPE_NAMES = Object.keys(TYPE)

module.exports = {}

Object.keys(TYPE).forEach(name => {
  module.exports[name] = chalk ?
    function () {
      var head = chalk[TYPE[name]](LOGO)
      var args = Array.prototype.slice.call(arguments, 0)
      console.log.apply(null, [head].concat(args))
    } :
    function () {
      var head = LOGO + `[${name}]`
      var args = Array.prototype.slice.call(arguments, 0)
      console.log.apply(null, [head].concat(args))
    }
})
