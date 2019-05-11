const assist = require('../kernel/assist');

function accessCache(cache) {
  const stub = cache;
  return (key, value) => {
    if (!key) return undefined;
    if (value != null) stub[key] = value;
    return stub[key];
  };
}

module.exports = async function launchLayer(app) {
  // global cache
  const globalCache = {};

  // app.epii.cache = fn(key, value) => globalCache
  assist.internal(
    app.epii,
    'cache',
    accessCache(globalCache),
    { enumerable: false }
  );

  app.use(async (ctx, next) => {
    // session cache
    const sessionCache = {};

    // ctx.epii.cache = fn(key, value) => sessionCache
    assist.internal(
      ctx.epii,
      'cache',
      accessCache(sessionCache)
    );

    // attach app API to ctx
    Object.keys(app.epii).forEach(key => {
      ctx.epii[key] = app.epii[key];
    });

    await next();
  });
};
