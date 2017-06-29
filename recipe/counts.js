'use strict'

const logger = require('../kernel/logger')

module.exports = function (app) {
  // init counts
  app.counts = {
    request: 0
  }

  var config = app.epii.config
  app.use(async function (ctx, next) {
    logger.info(`[${config.name}] <${ctx.status}> ${ctx.path}`)
    app.counts.request ++
    await next()
  })
}
