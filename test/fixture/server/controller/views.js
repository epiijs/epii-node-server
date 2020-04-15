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
      return this.epii.text('hello world');
    }
  },

  {
    path: '/debug/json',
    verb: 'get',
    body: async function () {
      return this.epii.json({ 'hello': 'world' });
    }
  },

  {
    path: '/debug/jump',
    verb: 'get',
    body: async function () {
      return this.epii.jump('/debug/text');
    }
  },

  {
    path: '/debug/jump-non-http',
    verb: 'get',
    body: async function () {
      return this.epii.jump('/debug/text', 'html')
    }
  },

  {
    path: '/debug/file',
    verb: 'get',
    body: async function () {
      const path = require('path');
      return this.epii.file(path.join(__dirname, '../../bucket/a.txt'));
    }
  },

  {
    path: '/debug/file-play',
    verb: 'get',
    body: async function () {
      const path = require('path');
      return this.epii.file(path.join(__dirname, '../../bucket/a.txt'), 'play');
    }
  },

  {
    path: '/debug/view/null',
    verb: 'get',
    body: async function () {
      return this.epii.view();
    }
  },

  {
    path: '/debug/view/done',
    verb: 'get',
    body: async function () {
      return this.epii.view('/debug/view1');
    }
  }
];
