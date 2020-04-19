const tester = require('./tester.js')

describe('action many verbs', function () {
  tester.test('1-path-n-verbs-1-body should done', function () {
    return {
      input: {
        path: '/debug/1-path-n-verbs-1-body/:id?',
        verb: 'post'
      },
      output: {
        code: 200,
        json: {
          type: '1-path, n-verbs, 1-body',
          body: 'POST'
        }
      }
    }
  })

  tester.test('1-path-n-verbs-1-body should done', function () {
    return {
      input: {
        path: '/debug/1-path-n-verbs-1-body/:id?',
        verb: 'put'
      },
      output: {
        code: 200,
        json: {
          type: '1-path, n-verbs, 1-body',
          body: 'PUT'
        }
      }
    }
  })

  tester.test('1-path-n-verbs-1-body should done', function () {
    return {
      input: {
        path: '/debug/1-path-n-verbs-1-body/:id?',
        verb: 'delete'
      },
      output: {
        code: 200,
        json: {
          type: '1-path, n-verbs, 1-body',
          body: 'DELETE'
        }
      }
    }
  });

  tester.test('post-body-json should done', function () {
    const data = { data: { abc: [1, 2, 3] } };
    return {
      input: {
        path: '/debug/post-body',
        verb: 'post',
        data: JSON.stringify(data),
      },
      output: {
        code: 200,
        json: data
      }
    };
  });

  tester.test('1-path-n-verbs-1-body should reset get', function () {
    return {
      input: {
        path: '/debug/1-path-n-verbs-1-body/:id?',
        verb: 'get'
      },
      output: {
        code: 200,
        json: {
          type: '1-path, n-verbs, reset-body',
          body: 'should reset, maybo todo boom'
        }
      }
    }
  });
});
