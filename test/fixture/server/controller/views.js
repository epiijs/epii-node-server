const { renders } = require('../../../../source');

module.exports = [
  {
    path: '/debug/null',
    verb: 'get',
    body: async function () {
      if (this.query.body) {
        this.body = 'null result with body';
      }
    }
  },

  {
    path: '/debug/text',
    verb: 'get',
    body: async function () {
      return renders.text('hello world');
    }
  },

  {
    path: '/debug/json',
    verb: 'get',
    body: async function () {
      return renders.json({ 'hello': 'world' });
    }
  },

  {
    path: '/debug/jump',
    verb: 'get',
    body: async function () {
      return renders.jump('/debug/text');
    }
  },

  {
    path: '/debug/jump-non-http',
    verb: 'get',
    body: async function () {
      return renders.jump('/debug/text', 'html')
    }
  },

  {
    path: '/debug/file',
    verb: 'get',
    body: async function () {
      const path = require('path');
      return renders.file(path.join(__dirname, '../../bucket/a.txt'));
    }
  },

  {
    path: '/debug/file-play',
    verb: 'get',
    body: async function () {
      const path = require('path');
      return renders.file(path.join(__dirname, '../../bucket/a.txt'), 'play');
    }
  },

  {
    path: '/debug/view/null',
    verb: 'get',
    body: async function () {
      return renders.view();
    }
  },

  {
    path: '/debug/view/done',
    verb: 'get',
    body: async function () {
      return renders.view('/debug/view1');
    }
  }
];
