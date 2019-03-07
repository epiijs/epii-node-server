'use strict'

const path = require('path')
const assist = require('../kernel/assist')
const loader = require('../kernel/loader')

const renders = {}

module.exports = async function (app) {
  // load operator
  await loader.load(
    path.join(__dirname, '../render'),
    (file, render) => {
      var name = path.basename(file).slice(0, -3)
      renders[name] = render
      // attach renders to app.epii
      // ctx.epii will own refs to them
      app.epii[name] = render.order
    }
  )

  app.use(async function (ctx, next) {
    // get controller action result
    var result = ctx.epii.cache('action')

    // default render
    if (!result) {
      if (!ctx.body) {
        ctx.status = 404
        ctx.body = 'not found'
      }
      return await next()
    }

    var render = renders[result.type]
    try {
      await render.solve.call(ctx, result)
    } catch (error) {
      ctx.status = 500
      ctx.body = error.stack
    }
  })
}
