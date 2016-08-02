const express   = require('express');
const passport  = require('passport');
const config    = require('config');

const auth      = require('hapkido/server/auth');
const debug     = require('hapkido/server/routes/debug');
const Account   = require('hapkido/server/models/account');

/* eslint-disable new-cap */
const router   = express.Router();
if (config.server.debug.routes) {
  debug(router);
}

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
    return;
  }
  res.render('index');
});

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
    return;
  }
  res.render('login', {
    loginFailed: (req.session.loginFailed || false),
    heading: 'Log In',
    layout: 'panel',
    errors: req.flash('error')
  });
});

router.post('/login',
  // authenticate with passport-local
  passport.authenticate('local', {
    successRedirect: '/dashboard', // TODO add support for req.session.redirectedFrom
    failureRedirect: '/login'
  })
);

router.get('/register', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
    return;
  }
  res.render('register', {
    messages: {
      error: req.flash('error')
    }
  });
});

router.post('/register', (req, res) => {
  // just for testing, TODO: create view
  Account.register(
    new Account({
      username: req.body.username
    }),
    req.body.password,
    (err, account) => {
      if (!err) {
        passport.authenticate('local')(req, res, () => {
          // res.send('register successful');
          if (req.session.redirectedFrom) {
            res.redirect(req.session.redirectedFrom);
          } else {
            res.redirect('/dashboard');
          }
        });
      } else {
        req.flash('error', err.message);
        res.redirect('/register');
      }
    }
  );
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

router.get(auth.googleCallbackPath,
  passport.authenticate('google', {
    successRedirect: '/dashboard', // TODO add support for req.session.redirectedFrom
    failureRedirect: '/login'
  })
);

router.get('/logout', (req, res) => {
  req.session.destroy();
  // TODO: replace with view
  // res.send('logout successful');
  res.redirect('/');
});

// protect all following routes
router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user && !req.user.initialized && req.path !== '/user/setup') {
      req.session.redirectedFrom = req.url;
      res.redirect('/user/setup');
    } else {
      next();
    }
  } else {
    console.log('Accessing a protected route although not authenticated');
    req.session.redirectedFrom = req.url;
    res.redirect('/login');
  }
});

router.get('/dashboard', (req, res) => res.render('dashboard'));
router.get('/user/setup', (req, res) => res.render('user/setup'));

router.use((req, res, next) => {
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
  } else if (req.accepts('json')) {
    res.send({ error: 'Not found' });
  } else {
    res.type('txt').send('Not found');
  }
});

module.exports = router;
