'use strict'

const path = require('path')
const assist = require('../kernel/assist')
const loader = require('../kernel/loader')
const logger = require('../kernel/logger')

const verbs = [
  'head', 'options', 'patch',
  'post', 'get', 'put', 'delete'
]

/**
 * normalize action & route
 *
 * @param  {Object} action
 */
function normalizeAction(action) {
  // normalize action verb
  // support 'verb' & 'method'
  var routeVerb = (action.verb || action.method || 'get').toLowerCase()
  // use 'get' verb by default
  if (verbs.indexOf(routeVerb) < 0) {
    routeVerb = 'get'
  }

  // normalize action path & body
  var routePath = action.path
  var routeBody = action.body

  return {
    verb: routeVerb,
    path: routePath,
    body: routeBody
  }
}

module.exports = async function (app) {
  var config = app.epii.config
  var router = require('koa-router')()

  function loadAction(file, actions) {
    actions = assist.arrayify(actions)
    actions.forEach(action => {
      // normalize action
      action = normalizeAction(action)

      // reload action
      var change = router.stack
        .findIndex(layer =>
          layer.name === action.path &&
          layer.methods.indexOf(action.verb.toUpperCase()) >= 0)
      if (change >= 0) {
        logger.info('reload action', action.path)
        router.stack.splice(change, 1)
      }

      // route action
      // call router.[verb]
      router[action.verb].call(
        // params: this, name, rule
        router, action.path, action.path,

        // params: wrapper
        async function (ctx, next) {
          var result = await action.body.call(ctx)
          if (result) {
            if (result.model) ctx.state = result.model
            result.route = { verb: action.verb, path: action.path }
          }
          ctx.epii.cache('action', result)
          await next()
        }
      )
    })
  }

  // use loader
  var routerDir = path.join(config.path.root, config.path.server.controller)
  await loader.load(routerDir, loadAction)
  loader.watch('controller', routerDir, loadAction)

  // use router
  app.use(router.routes())
  app.use(router.allowedMethods())
}
