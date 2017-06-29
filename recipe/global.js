'use strict'

const assist = require('../kernel/assist')

module.exports = function (app) {
  if (!app.epii) {
    throw new Error('invalid epii app')
  }

  // global cache
  var epiiGlobal = {}

  // app.epii.cache = fn(key, value) => epiiGlobal
  assist.internal(
    app.epii, 'cache',
    function (key, value) {
      if (!key) return
      if (value != null) epiiGlobal[key] = value
      return epiiGlobal[key]
    },
    { enumerable: false }
  )

  app.use(async function (ctx, next) {
    // local api
    ctx.epii = {}

    // local cache
    var epiiLocal = {}

    // ctx.epii.cache = fn(key, value) => epiiLocal
    assist.internal(
      ctx.epii, 'cache',
      function (key, value) {
        if (!key) return
        if (value != null) epiiLocal[key] = value
        return epiiLocal[key]
      }
    )

    // attach app api to ctx
    Object.keys(app.epii).forEach(key => {
      ctx.epii[key] = app.epii[key]
    })

    await next()
  })
}
