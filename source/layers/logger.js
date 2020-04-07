module.exports = async function loggerLayer(app) {
  app.use(async (ctx, next) => {
    await next();
  });
};
