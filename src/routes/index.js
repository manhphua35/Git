const meRouter = require('./me');
const siteRouter = require('./site');
const courseRouter = require('./courses');
const accountRouter = require('./account');
function route(app) {
  app.use('/account', accountRouter);
  app.use('/me', meRouter);
  app.use('/courses', courseRouter);
  app.use('/',siteRouter);
  
}

module.exports = route;
