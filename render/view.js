'use strict'

const fs = require('fs')
const path = require('path')
const HTML5 = require('epii-html5')
const logger = require('../kernel/logger.js')

const nullViewMeta = new HTML5.ViewMeta({
  body: { holder: { source: '<p>undefined view meta</p>' } }
})

/**
 * resolve meta path
 *
 * @param  {Object} conf - app config
 * @param  {String} name - meta file name
 * @return {ViewMeta} view
 */
function resolve(conf, name) {
  // client view meta
  if (name.endsWith('index.meta.js')) {
    return path.join(conf.path.root, conf.path.client, name)
  }
  // layout view meta
  if (!name.endsWith('.meta.js')) name = name + '.meta.js'
  return path.join(conf.path.root, conf.path.layout, name)
}

module.exports = {
  /**
   * process view
   *
   * @param  {Object} result
   */
  solve: async function (result) {
    // get app config
    var config = this.app.epii.config

    // get or init cache
    var metaPack = this.app.epii.metaPack
    if (!metaPack) {
      metaPack = new HTML5.MetaPack(
        resolve.bind(this, config),
        {
          prefix: config.prefix.static,
          source: path.join(config.path.root, config.path.static)
        }
      )
      this.app.epii.metaPack = metaPack
    }

    // lazy load client meta
    if (!result.name) {
      result.name = result.route.path
    }
    var viewMeta = metaPack.getViewMeta(result.name)
    if (!viewMeta || !config.online) {
      let viewPath = path.join(result.name, 'index.meta.js')
      viewMeta = metaPack.loadViewMeta(viewPath)
    }

    // mount view with state
    await viewMeta.mount(result.model)

    // render view into html
    this.body = HTML5.renderToString(viewMeta)
    this.set('content-type', 'text/html')
  },

  /**
   * get view result
   *
   * @param  {String=} name - view name
   * @param  {Object=} model
   * @return {Object} view result
   */
  order: function (name, model) {
    return {
      type: 'view',
      name: !name || typeof name !== 'string' ? null : name,
      model: name && typeof name !== 'string' ? name : model
    }
  }
}
