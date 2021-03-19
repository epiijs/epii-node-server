const { renders } = require('../../../../source');

module.exports = [
  {
    path: '/debug/1-path-n-verbs-1-body/:id?',
    verb: ['get', 'post', 'put', 'delete'],
    body: async function () {
      return renders.json({
        type: '1-path, n-verbs, 1-body',
        body: this.method
      })
    }
  },

  {
    path: '/debug/1-path-n-verbs-1-body/:id?',
    verb: 'get',
    body: async function () {
      return renders.json({
        type: '1-path, n-verbs, reset-body',
        body: 'should reset, maybo todo boom'
      })
    }
  },

  {
    path: '/debug/post-body',
    verb: 'post',
    body: async function () {
      return renders.json(this.request.body);
    }
  }
];
