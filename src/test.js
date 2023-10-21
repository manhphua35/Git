const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const { create } = require('express-handlebars');
const AccountModel = require('./app/models/Account');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');



const app = express();
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));




////////////////////////////////

const route = require('./routes');
const db = require('./config/db');
db.connect();
const hbs = create({
  helpers: {
      sum : (a,b) => a+b
  }
});



app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'resources' ,'views'));
console.log(path.join(__dirname, 'views'));
route(app);
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
