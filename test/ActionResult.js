const path = require('path')
const tester = require('./tester.js')

describe('action result', function () {
  tester.test('render null', function () {
    return {
      input: {
        path: '/debug/null'
      },
      output: {
        code: 404
      }
    }
  })

  tester.test('render null with body', function () {
    return {
      input: {
        path: '/debug/null?body=true'
      },
      output: {
        code: 200,
        body: 'null result with body'
      }
    }
  })

  tester.test('render text', function () {
    return {
      input: {
        path: '/debug/text'
      },
      output: {
        code: 200,
        text: 'hello world'
      }
    }
  })

  tester.test('render json', function () {
    return {
      input: {
        path: '/debug/json'
      },
      output: {
        code: 200,
        json: { 'hello': 'world' }
      }
    }
  })

  tester.test('render file', function () {
    return {
      input: {
        path: '/debug/file'
      },
      output: {
        code: 200,
        head: {
          'content-type': 'application/octet-stream'
        },
        text: 'abc'
      }
    }
  })

  tester.test('render view null', function () {
    return {
      input: {
        path: '/debug/view/null'
      },
      output: {
        code: 500
      }
    }
  })

  tester.test('render view done', function () {
    return {
      input: {
        path: '/debug/view/done'
      },
      output: {
        code: 200,
        file: path.join(__dirname, './fixture/bucket/view1.html')
      }
    }
  })

  tester.test('static .well-known', function () {
    return {
      input: {
        path: '/.well-known/test'
      },
      output: {
        code: 200,
        file: path.join(__dirname, './fixture/static/.well-known/test')
      }
    }
  })
})
