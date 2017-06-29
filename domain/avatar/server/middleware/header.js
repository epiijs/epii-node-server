'use strict'

module.exports = async function (ctx, next) {
  console.log('header', ctx.path, ctx.get('user-agent'))
  await next()
}
