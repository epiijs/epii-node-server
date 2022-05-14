module.exports = async ({ context }, next) => {
  console.log('>', context.path, '|', context.get('user-agent'));
  await next();
  console.log('<', context.path, context.status);
}
