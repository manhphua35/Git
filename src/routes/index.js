const meRouter = require('./me');
const courseRouter = require('./courses');
const accountRouter = require('./account');
const siteRouter = require('./site');
function route(app) {
  app.use('/account', accountRouter);
  app.use('/me', meRouter);
  app.use('/courses', courseRouter);
  app.use('/', siteRouter);
}

module.exports = route;
