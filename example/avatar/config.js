module.exports = {
  name: 'EPII-Avatar',
  port: 8080,
  path: {
    root: __dirname,
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
