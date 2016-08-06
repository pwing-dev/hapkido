const express       = require('express');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const randomstring  = require('randomstring');
const apprequire    = require('requirefrom')('server');
const config        = require('config');
const ipFilter      = require('express-ipfilter');

const globalState   = apprequire('models/global-state');
const appauth       = apprequire('auth');

module.exports = app => {
  // all middlewares we register will pass on if this is false
  let active = true;

  // initialize key, so `post`ing "undefined" to login won't work
  let key = randomstring.generate();

  /* eslint-disable new-cap */
  const setuptool = express.Router();

  app.use(passport.initialize());
  app.use(passport.session());
  passport.use('setuptool-otp',
    new LocalStrategy((username, password, done) => {
      if (!active) {
        done(null, false);
      } else if (password !== key) {
        done(null, false);
      } else {
        done(null, { user: 'admin' });
      }
    })
  );
  // Passing 'pass' as first argument givs the next serializer the chance to
  // serialize
  // Also always pass on the user so later serializers get access to it
  passport.serializeUser((user, done) => done(active ? null : 'pass', user));
  passport.deserializeUser((user, done) => done(active ? null : 'pass', user));

  // initialize IP filter
  setuptool.use(ipFilter(config.get('server.ipRanges.setup'), {
    mode: 'allow',
    log: config.get('server.debug.verbosity') > 0,
  }));

  setuptool.get('/login', (req, res) => {
    key = randomstring.generate();
    console.log(`\
########################################
########################################
##                                    ##
##  Passphrase for setup tool:        ##
##  ${             key             }  ##
##                                    ##
########################################
########################################`
    );
    res.render('setuptool/login');
  });
  setuptool.post('/login', passport.authenticate('setuptool-otp', { failureRedirect: '/login' }),
    (req, res) => {
      if (req.redirectedFrom) {
        res.redirect(req.redirectedFrom);
      } else {
        res.redirect('/');
      }
    }
  );

  // protect all following routes
  setuptool.use((req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.session.redirectedFrom = req.url;
      res.redirect('/login');
    }
  });

  setuptool.get('/', (req, res) => {
    res.render('setuptool/index');
  });

  setuptool.get('/overview', (req, res) => {
    res.render('setuptool/overview');
  });
  setuptool.post('/done', (req, res) => {
    globalState.setSetupComplete(err => {
      res.redirect('/done');
    });
  });
  setuptool.get('/done', (req, res) => {
    res.render('setuptool/done');
  });
  setuptool.post('/restart', (req, res) => {
    // Remove/disable all traces of the setup tool
    req.session.destroy(err => {
      if (err) {
        return req.send(500);
      }
      active = false;
      appauth.middleware(); // Just creating the middleware will extend passport with the additional strategies
      res.redirect('/');
    });
  });
  // Redirect all other requests to /
  setuptool.use((req, res, next) => {
    if (active) {
      res.redirect('/'); // TODO show 404
    } else {
      next();
    }
  });
  return (req, res, next) => {
    if (active) {
      setuptool(req, res, next);
    } else {
      next();
    }
  };
};
