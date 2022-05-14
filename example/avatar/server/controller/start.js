module.exports = [
  {
    path: '/',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.view('index');
    }
  },

  {
    path: '/path/:data/more',
    verb: 'get',
    body: async ({ renders, params }) => {
      return renders.json(params);
    }
  },

  {
    path: '/path/*',
    verb: 'get',
    body: async ({ renders, params }) => {
      return renders.json(params);
    }
  },

  {
    path: '/jump/html',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.jump('/', 'html');
    }
  },

  {
    path: '/jump/http',
    verb: 'get',
    body: async ({ renders }) => {
      return renders.jump('/', 'http');
    }
  }
];
