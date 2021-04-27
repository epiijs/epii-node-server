module.exports = {
  /**
   * process jump
   *
   * @param  {Object} result
   */
  solve: async (ctx, result) => {
    if (result.mode === 'http') {
      ctx.redirect(result.name);
    } else {
      ctx.set('content-type', 'text/html');
      ctx.body = `<script>setTimeout(function(){location.href='${result.name}'}, 0)</script>`;
    }
  },

  /**
   * get jump result
   *
   * @param  {String} name - jump target
   * @param  {String} mode - jump method, http or html
   * @return {Object} jump result
   */
  order: (name, mode = 'http') => {
    return {
      type: 'jump',
      name,
      mode
    };
  }
};
