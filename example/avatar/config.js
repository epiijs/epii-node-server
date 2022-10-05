module.exports = {
  shared: {
    name: 'avatar',
    port: 8080,
    root: __dirname,
    path: {
      service: 'server/service',
      middleware: 'server/middleware',
      controller: 'server/controller',
      document: 'server/document',
      static: 'static'
    }
  },

  logger: {
  },

  loader: {
  },

  filter: {
    series: ['header']
  },

  router: {
  },

  render: {
    action: { // 名字好奇怪
    },
    static: {
      prefix: '__file',
      expose: ['.well-known']
    }
  },
}
