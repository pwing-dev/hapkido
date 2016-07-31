const express  = require('express');
const passport = require('passport');
const auth     = require('./auth');
const url      = require('url');
const config   = require('config');
const urljoin  = require('url-join');

const router   = express.Router();
const baseUrl  = url.parse(config.get('server.baseURL'));

// append url to basepath
const genRedirect = redirectPath => {
  return urljoin(baseUrl.pathname || '/', redirectPath);
};

router.get('/login', (req, res) => {
  if (req.session.authenticated) {
    res.redirect(genRedirect('/dashboard'));
    return;
  }
  res.render('login', {
    loginFailed: (req.session.loginFailed || false),
    heading: 'Log In',
    layout: 'panel',
  });
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

router.get(
  auth.googleCallbackPath,
  passport.authenticate('google', { failureRedirect: genRedirect('/login') }),
  (req, res) => {
    req.session.authenticated = true;
    // Successful authentication, redirect home.
    res.redirect(genRedirect('/dashboard'));
  }
);

router.post('/login', (req, res) => {
  // TODO: replace with passport
  if (req.body.username === 'test' && req.body.password === 'test') {
    req.session.user_name       = 'test';
    req.session.user_id         = '0';
    req.session.authenticated   = true;
    req.session.loginFailed     = false;

    if (req.session.reqPreAuth) {
      res.redirect(req.session.reqPreAuth);
    } else {
      res.redirect(genRedirect('/dashboard'));
    }
    return;
  }

  req.session.authenticated   = false;
  req.session.loginFailed     = true;

  res.redirect(genRedirect('/login'));
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  // TODO: replace with view
  res.send('logout successful');
});

// protect all following routes
router.use((req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    req.session.reqPreAuth = req.url; // store requested URL not allowed
    res.redirect(genRedirect('/login'));
  }
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

module.exports = router;
