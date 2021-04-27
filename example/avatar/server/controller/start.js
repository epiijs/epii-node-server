module.exports = [
  {
    path: '/',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.view();
    }
  },

  {
    path: '/jump',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.jump('/', 'html');
    }
  }
];
