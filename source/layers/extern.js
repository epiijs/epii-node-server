/* eslint-disable global-require */
const path = require('path');

module.exports = async function externLayer(app) {
  const config = app.epii.config;
  app.use(require('koa-body')({
    multipart: true,
    formidable: {
      uploadDir: path.join(config.path.root, config.path.upload)
    }
  }));
};
