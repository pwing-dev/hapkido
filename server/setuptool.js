const express       = require('express');
const Passport      = require('passport').Passport;
const LocalStrategy = require('passport-local').Strategy;
const randomstring  = require('randomstring');
const apprequire    = require('requirefrom')('server');
const config        = require('config');
const ipFilter      = require('express-ipfilter');

const Application   = apprequire('models/application');

module.exports = app => {
  // all middlewares we register will pass on if this is false
  let active = true;

  // initialize key, so `post`ing "undefined" to login won't work
  let key = randomstring.generate();

  /* eslint-disable new-cap */
  const setuptool = express.Router();
  const passport = new Passport();

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

  setuptool.use(passport.initialize());
  setuptool.use(passport.session());
  
  // initialize IP filter
  setuptool.use(ipFilter(config.get('setuptool.whitelist'), {
    mode: 'allow',
    log: config.get('debug.verbosity') > 0,
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
    Application.setSetupComplete(err => {
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
