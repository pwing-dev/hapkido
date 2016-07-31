const express         = require('express');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const session         = require('express-session');
const exphbs          = require('express-handlebars');
const morgan          = require('morgan');
const config          = require('config');
const appRoot         = require('app-root-path').toString();
const mongoose        = require('mongoose');
const MongoSession    = require('connect-mongo')(session);
const url             = require('url');

const auth            = require('./auth');
const handleStatic    = require('./routes/static');
const router          = require('./routes/router');

const baseUrl         = url.parse(config.get('server.baseURL'));

// initialize mongoose
mongoose.connect(config.get('server.mongo'));
const db = mongoose.connection;
db.on('error', e => console.error('Connection error: ', e));
db.on('open', () => {
  // express setup
  const app = express();

  // body parser
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // cookie parser
  app.use(cookieParser());

  // session management
  app.use(
    session({
      secret: config.get('server.session.secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: '/',
        httpOnly: true,
        maxAge: config.get('server.session.expiry')
      },
      store: new MongoSession({
        mongooseConnection: db
      })
    })
  );

  // request logging
  app.use(morgan('dev'));

  // static asset generation
  handleStatic(app);

  // setup passport authentication
  auth.init(app);

  // Templating
  app.set('views', 'frontend/html/');
  app.engine('.hbs', exphbs({
    defaultLayout: 'default',
    extname: '.hbs',
    layoutsDir: 'frontend/html/layouts/',
    partialsDir: 'frontend/html/partials/',
    helpers: {
      title: config.get('app.name'),
      ifdef: (variable, options) => {
        if (typeof variable !== 'undefined') {
          return options.fn(this);
        }
        return options.inverse(this);
      }
    }
  }));

  app.set('view engine', '.hbs');

  // include router at subdirectory specified in config.json
  app.use(baseUrl.pathname || '/', router);

  app.listen(config.get('server.port'));
});
