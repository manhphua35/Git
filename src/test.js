const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const handlebars = require('express-handlebars'); // Đổi tên biến thành handlebars
const AccountModel = require('./app/models/Account');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const localStorage = require('node-localstorage');
const ExcelJS = require('exceljs');
const cors = require('cors');
const app = express();
app.use(express.json());

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname +'/public'));
const hbs = handlebars.create({ 
  helpers: {
    sum: (a, b) => a + b
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'resources', 'views'));

const route = require('./routes');
const db = require('./config/db');
db.connect();

route(app);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
