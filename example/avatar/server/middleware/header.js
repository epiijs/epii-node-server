module.exports = async ({ context }, next) => {
  console.log('header', context.path, context.get('user-agent'));
  await next();
}
