module.exports = {
  name: 'epii-server',
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
  static: {
    prefix: '__file',
  },
  expert: {
    'well-known': true
  }
}
