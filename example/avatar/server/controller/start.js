module.exports = [
  {
    path: '/',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.view('index');
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
