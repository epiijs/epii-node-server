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
    static: 'static'
  },
  prefix: {
    static: '__file'
  },
  expert: {
    'well-known': true
  }
}
