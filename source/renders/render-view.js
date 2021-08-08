const path = require('path');
const HTML5 = require('@epiijs/html5');

const context = {
  layout: null,
};

/**
 * resolve meta path
 *
 * @param  {Object} conf - app config
 * @param  {String} name - meta file name
 * @return {String} full meta file path
 */
function resolve(conf, name) {
  // client view meta
  if (name.endsWith('index.meta.js')) {
    return path.join(conf.path.root, conf.path.client, name);
  }
  // layout view meta
  let fullPath = path.join(conf.path.root, conf.path.layout, name);
  if (!fullPath.endsWith('.meta.js')) fullPath += '.meta.js';
  return fullPath;
}

module.exports = {
  /**
   * process view
   *
   * @param  {Object} result
   */
  solve: async (ctx, result) => {
    // get app config
    const container = ctx.app.epii;
    const config = container.service('config');

    // get or init view cache
    let viewPack = context.layout;
    if (!viewPack) {
      viewPack = new HTML5.ViewPack(
        resolve.bind(null, config),
      );
      viewPack.useLoader(
        HTML5.FileLoader,
        {
          prefix: config.static.prefix,
          source: path.join(config.path.root, config.path.static)
        }
      );
      context.layout = viewPack;
      container.provide('layout', viewPack);
    }

    // lazy load client meta
    const viewName = result.name || result.route.path;
    let viewMeta = viewPack.getViewMeta(viewName);
    if (!viewMeta || ctx.app.env === 'development') {
      const viewPath = path.join(viewName, 'index.meta.js');
      viewMeta = viewPack.loadViewMeta(viewPath);
    }

    // mount view with model
    await viewMeta.mount(viewPack.loaders, result.model);

    // render view into html
    ctx.body = HTML5.renderToString(viewMeta);
    ctx.set('content-type', 'text/html');
  },

  /**
   * get view result
   *
   * @param  {String=} name - view name
   * @param  {Object=} model
   * @return {Object} view result
   */
  order: (name, model) => {
    return {
      type: 'view',
      name: !name || typeof name !== 'string' ? null : name,
      model: name && typeof name !== 'string' ? name : model
    };
  }
};
