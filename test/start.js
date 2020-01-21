const path = require('path')

var epiiServer = require('../vm')([
  {
    name: 'EPII-Test',
    port: 8080,
    path: {
      root: path.join(__dirname, 'fixture'),
      server: {
        controller: 'server/controller',
        middleware: 'server/middleware'
      },
      client: 'client',
      layout: 'layout',
      static: 'static',
      upload: 'upload'
    },
    prefix: {
      static: '__static'
    },
    expert: {
      'well-known': true
    }
  }
])