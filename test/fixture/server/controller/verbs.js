module.exports = [
  {
    path: '/debug/1-path-n-verbs-1-body/:id?',
    verb: ['get', 'post', 'put', 'delete'],
    body: async ({ context, renders }) => {
      return renders.json({
        type: '1-path, n-verbs, 1-body',
        body: context.method
      })
    }
  },

  {
    path: '/debug/1-path-n-verbs-1-body/:id?',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.json({
        type: '1-path, n-verbs, reset-body',
        body: 'should reset, maybo todo boom'
      })
    }
  },

  {
    path: '/debug/post-body',
    verb: 'post',
    body: async ({ context, renders }) => {
      return renders.json(context.request.body);
    }
  }
];
