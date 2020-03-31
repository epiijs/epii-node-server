module.exports = [
  {
    path: '/',
    verb: 'get',
    body: async function () {
      return this.epii.view();
    }
  },

  {
    path: '/jump',
    verb: 'get',
    body: async function () {
      return this.epii.jump('/', 'html');
    }
  }
];
