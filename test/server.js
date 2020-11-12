const path = require('path')

require('../source')([
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
      static: 'static'
    },
    prefix: {
      static: '__static'
    },
    expert: {
      'well-known': true
    }
  }
])