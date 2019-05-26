module.exports = [
  {
    path: '/debug/null',
    verb: 'get',
    body: async function () {
      if (this.query.body) {
        this.body = 'null result with body'
      }
    }
  },

  {
    path: '/debug/text',
    verb: 'get',
    body: async function () {
      return this.epii.text('hello world')
    }
  },

  {
    path: '/debug/json',
    verb: 'get',
    body: async function () {
      return this.epii.json({ 'hello': 'world' })
    }
  },

  {
    path: '/debug/file',
    verb: 'get',
    body: async function () {
      var path = require('path')
      return this.epii.file(path.join(__dirname, '../../bucket/a'))
    }
  },

  {
    path: '/debug/view/null',
    verb: 'get',
    body: async function () {
      return this.epii.view()
    }
  },

  {
    path: '/debug/view/done',
    verb: 'get',
    body: async function () {
      return this.epii.view('/debug/view1')
    }
  }
]
