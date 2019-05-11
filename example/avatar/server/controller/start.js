module.exports = [
  {
    path: '/',
    verb: 'get',
    body: async function () {
      return this.epii.view();
    }
  }
]
