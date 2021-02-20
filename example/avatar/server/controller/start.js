const { renders } = require('../../../../source');

module.exports = [
  {
    path: '/',
    verb: 'get',
    body: async function () {
      return renders.view();
    }
  },

  {
    path: '/jump',
    verb: 'get',
    body: async function () {
      return renders.jump('/', 'html');
    }
  }
];
