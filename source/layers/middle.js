const fs = require('fs');
const path = require('path');
const compose = require('koa-compose');
const logger = require('../kernel/logger');
const loader = require('../kernel/loader');

function lintOrder(order) {
  if (!Array.isArray(order)) {
    logger.halt('invalid middleware order');
    return [];
  }
  return order;
}

module.exports = async function middleLayer(app) {
  const config = app.epii.config;
  const middleDir = path.join(config.path.root, config.path.server.middleware);
  const middleFiles = fs.readdirSync(middleDir).filter(e => !e.startsWith('$'));
  const middleItems = {
    $order: lintOrder(loader.loadFile(path.join(middleDir, '$order.js')))
  };

  function composeMiddle() {
    const series = [];
    middleItems.$order.forEach(name => {
      const item = middleItems[name];
      if (item) {
        if (Array.isArray(item)) {
          series = series.concat(item);
        } else if (typeof item === 'function') {
          series.push(item);
        }
      }
    });
    if (series.length === 0) {
      middleItems.$mixed = async (ctx, next) => {
        logger.warn('middleware not found');
        await next();
      };
    } else {
      middleItems.$mixed = compose(series);
    }
  }

  function loadMiddle(e, o, file) {
    const name = path.basename(file).slice(0, -3);
    if (name === '$order') {
      middleItems.$order = lintOrder(o);
    } else {
      middleItems[name] = o;
    }
    // compose reload unit after first composed
    if (middleItems.$mixed) {
      composeMiddle();
    }
  }

  middleFiles.forEach(file => {
    const fullPath = path.join(middleDir, file);
    loader.loadFile(fullPath, loadMiddle);
  });
  composeMiddle();
  loader.autoLoadDir('middleware', middleDir, loadMiddle);

  app.use(async (ctx, next) => {
    await middleItems.$mixed.call(null, ctx, next);
  });
};
