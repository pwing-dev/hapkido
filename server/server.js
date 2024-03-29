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
const assets          = apprequire('static');
const router          = apprequire('routes/router');

const AppState        = apprequire('models/application');
const setuptool       = apprequire('setuptool');

/* eslint-disable object-shorthand, no-underscore-dangle, quote-props, consistent-return */
const createApp = () => new Promise((resolve, reject) => AppState.assertInitialized((error, Application) => {
  const db = mongoose.connection;
  // we are in an async callback now, so if something bad happens, it will get
  // get lost in promise-nirvana if we don't handle it explicitly
  try {
    if (error) {
      reject(error);
    }
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
        secret: Application.getSessionSecret(),
        resave: false,
        saveUninitialized: false,
        cookie: {
          path: '/',
          httpOnly: true,
          maxAge: config.get('sessionDuration')
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
          __: function(...args) {
            return i18n.__.apply(this, ...args);
          },
          __n: function(...args) {
            return i18n.__n.apply(this, ...args);
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

    if (Application.isSetupComplete()) {
      // include router at subdirectory specified in config.json
      app.use('/', router());
    } else {
      app.use('/', setuptool(app), router());
    }
    resolve(app);
  } catch(e) {
    reject(e);
  }
}));


const createServer = () => new Promise((resolve, reject) => {
  // initialize mongoose
  mongoose.Promise = Promise;
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    mongoose.connect(config.get('mongo'));
    const db = mongoose.connection;
    db.on('error', e => reject(e));
    db.on('open', () => createApp().then(resolve, reject));
  } else {
    console.warn('Using hapkido with an existing mongoose connection');
    createApp().then(resolve, reject);
  }
});
module.exports = createServer;
