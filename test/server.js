const path = require('path');
const { startServer } = require('../target');

startServer({
  name: 'EPII-Test',
  port: 8080,
  path: {
    root: path.join(__dirname, 'fixture'),
    server: {
      controller: 'server/controller',
      middleware: 'server/middleware',
      service: 'server/service',
    },
    client: 'client',
    layout: 'layout',
    static: 'static'
  },
  static: {
    prefix: '__static',
  },
  expert: {
    'well-known': true
  }
});
