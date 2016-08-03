const express         = require('express');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const session         = require('express-session');
const exphbs          = require('express-handlebars');
const morgan          = require('morgan');
const config          = require('config');
const mongoose        = require('mongoose');
const MongoSession    = require('connect-mongo')(session);
const flash           = require('connect-flash');
const path            = require('path');

const apprequire      = require('requirefrom')('server');
const auth            = apprequire('auth');
const handleStatic    = apprequire('static');
const router          = apprequire('routes/router');

const createServer = () => new Promise((resolve, reject) => {
  // initialize mongoose
  mongoose.Promise = Promise;
  mongoose.connect(config.get('server.mongo'));
  const db = mongoose.connection;
  db.on('error', e => reject(e));
  db.on('open', () => {
    // express setup
    const app = express();

    // body parser
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // cookie parser
    app.use(cookieParser());

    app.use(flash());

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

    const frontendDir = 'frontend';

    // Templating
    app.set('views', path.join(frontendDir, 'html/'));
    app.engine('.hbs', exphbs({
      defaultLayout: 'default',
      extname: '.hbs',
      layoutsDir: path.join(frontendDir, '/html/layouts/'),
      partialsDir: path.join(frontendDir, '/html/partials/'),
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
    app.use('/', router);
    resolve(app);
  });
});
module.exports = createServer;
