const express   = require('express');
const passport  = require('passport');
const auth      = require('../auth');
const url       = require('url');
const config    = require('config');
const LocalUser = require('../models/user/user-local');

const router   = express.Router();
const baseUrl  = url.parse(config.get('server.baseURL'));

router.get('/', (req, res) => {
  if (req.session.authenticated) {
    res.redirect(genRedirect('/dashboard'));
    return;
  }
  res.render('index');
});

router.get('/login', (req, res) => {
  console.log(req.user);
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

router.post('/login',
  // authenticate with passport-local. TODO: req.flash
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    //failureFlash: true,
  }),
  (req, res) => {
    // passport
    res.redirect('/login');
  }
);

router.get('/register', (req, res) => {
  if (req.session.authenticated) {
    res.redirect(genRedirect('/dashboard'));
    return;
  }
  res.render('register');
});

router.post('/register', (req, res) => {
  // just for testing, TODO: create view
  LocalUser.register(
    new LocalUser({
      username: req.body.username
    }),
    req.body.password,
    (err, account) => {
      passport.authenticate('local')(req, res, () => {
        res.send('register successful');
      });
    }
  );
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

router.get(auth.googleCallbackPath,
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.authenticated = true;
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  }
);

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
    res.redirect('/login');
  }
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

module.exports = router;
