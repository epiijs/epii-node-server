module.exports = {
  name: 'epii-server',
  port: 8080,
  path: {
    root: __dirname,
    client: 'client',
    server: {
      service: 'server/service',
      middleware: 'server/middleware',
      controller: 'server/controller',
      document: 'server/document',
    },
    static: 'static'
  },
  static: {
    prefix: '__file',
  },
  expert: {
    'well-known': true,
    'inject-koa': false,
  }
}
