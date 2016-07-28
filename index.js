const express         = require('express');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const session         = require('express-session');
const exphbs          = require('express-handlebars');
const morgan          = require('morgan');
const config          = require('config');
const appRoot         = require('app-root-path').toString();

const handleStatic    = require('./routes/static');
const router          = require('./routes/router');

// express setup
const app = express();

// body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// cookie parser
app.use(cookieParser());

// request logging
app.use(morgan('dev'));

// static asset generation
handleStatic(app);

// Templating
app.set('views', 'frontend/html/');
app.engine('.hbs', exphbs({
  defaultLayout: 'default',
  extname: '.hbs',
  layoutsDir: 'frontend/html/layouts/',
  partialsDir: 'frontend/html/partials/'
}));

app.set('view engine', '.hbs');

// include router
app.use('/', router);

app.listen(config.get('server.port'));
