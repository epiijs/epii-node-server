module.exports = [
  {
    path: '/debug/null',
    verb: 'get',
    body: async ({ context }) => {
      if (context.query.body) {
        context.body = 'null result with body';
      }
    }
  },

  {
    path: '/debug/text',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.text('hello world');
    }
  },

  {
    path: '/debug/json',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.json({ 'hello': 'world' });
    }
  },

  {
    path: '/debug/jump',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.jump('/debug/text');
    }
  },

  {
    path: '/debug/jump-non-http',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.jump('/debug/text', 'html')
    }
  },

  {
    path: '/debug/file',
    verb: 'get',
    body: async ({ renders }) => {
      const path = require('path');
      return renders.file(path.join(__dirname, '../../bucket/a.txt'));
    }
  },

  {
    path: '/debug/file-play',
    verb: 'get',
    body: async ({ renders }) => {
      const path = require('path');
      return renders.file(path.join(__dirname, '../../bucket/a.txt'), 'play');
    }
  },

  {
    path: '/debug/view/null',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.view();
    }
  },

  {
    path: '/debug/view/done',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.view('/debug/view1');
    }
  }
];
