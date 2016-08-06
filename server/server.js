const express         = require('express');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const session         = require('express-session');
const exphbs          = require('express-handlebars');
const handlebars      = require('handlebars');
const hbsrender       = require('handlebars-render-helper');
const hbsi18n         = require('handlebars-helper-i18n');
const i18n            = require('i18n');
const morgan          = require('morgan');
const config          = require('config');
const mongoose        = require('mongoose');
const MongoSession    = require('connect-mongo')(session);
const flash           = require('connect-flash');
const path            = require('path');
const ipFilter        = require('express-ipfilter');

const apprequire      = require('requirefrom')('server');
const auth            = apprequire('auth');
const assets          = apprequire('static');
const router          = apprequire('routes/router');

const Application     = apprequire('models/application');
const setuptool       = apprequire('setuptool');

const createServer = () => new Promise((resolve, reject) => {
  // initialize mongoose
  mongoose.Promise = Promise;
  mongoose.connect(config.get('mongo'));
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

    // IP Filter
    app.use(ipFilter(config.get('whitelist'), {
      mode: 'allow',
      log: config.get('debug.verbosity') > 0,
    }));

    // Reverse Proxy
    if (config.get('reverseProxy')) {
      app.set('trust proxy', config.get('reverseProxy'));
    }

    // flash message support on responses
    app.use(flash());
    // i18n
    i18n.configure({
      locales: ['en', 'de'],
      fallbacks: {
        de: 'en'
      },
      defaultLocale: 'en',
      cookie: 'locale',
      queryParameter: 'lang',
      directory: path.join(__dirname, '../frontend/locales'),
      directoryPermissions: '755',
      autoReload: true,
      updateFiles: true,
      api: {
        '__': '__',  // now req.__ becomes req.__
        '__n': '__n' // and req.__n can be called as req.__n
      }
    });
    app.use(i18n.init);

    // session management
    app.use(
      session({
        secret: config.get('session.secret'),
        resave: false,
        saveUninitialized: false,
        cookie: {
          path: '/',
          httpOnly: true,
          maxAge: config.get('session.expiry')
        },
        store: new MongoSession({
          mongooseConnection: db
        })
      })
    );

    // request logging
    if (config.get('logging.enabled')) {
      app.use(morgan('dev'));
    }

    // static asset generation
    app.use(assets);

    const frontendDir = 'frontend';

    // templating
    app.set('views', path.join(frontendDir, 'html/'));
    app.engine('.hbs', exphbs({
      defaultLayout: 'default',
      extname: '.hbs',
      layoutsDir: path.join(frontendDir, '/html/layouts/'),
      partialsDir: path.join(frontendDir, '/html/partials/'),
      'handlebars': handlebars,
      helpers: {
        helpers: {
          __: function(){
            return i18n.__.apply(this, arguments);
          },
          __n: function(){
            return i18n.__n.apply(this, arguments);
          }
        },
        title: 'hapkido',
        render: hbsrender(handlebars),
        ifdef: (variable, options) => {
          if (typeof variable !== 'undefined') {
            return options.fn(this);
          }
          return options.inverse(this);
        },
      }
    }));

    app.set('view engine', '.hbs');

    Application.isSetupComplete((err, complete) => {
      if (err) return reject(err);
      if (complete) {
        // setup passport authentication
        app.use(auth.middleware());
        // include router at subdirectory specified in config.json
        app.use('/', router);
      } else {
        app.use('/', setuptool(app), router);
      }
      resolve(app);
    });
  });
});
module.exports = createServer;
