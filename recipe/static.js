const path = require('path')
const send = require('koa-send')

module.exports = async function (app) {
  const config = app.epii.config

  app.use(async function (ctx, next) {
    var prefix = config.prefix.static

    // fix prefix for this.path
    if (!/^\//.test(prefix)) prefix = '/' + prefix

    // use koa-send
    if (ctx.path.startsWith(prefix)) {
      var name = ctx.path.slice(prefix.length)
      return await send(ctx, name, {
        root: path.join(config.path.root, config.path.static)
      })
    }

    await next()
  })
}
