const express     = require('express');
const Passport    = require('passport').Passport;
const config      = require('config');
const recaptcha   = require('express-recaptcha');

const apprequire  = require('requirefrom')('server');
const auth        = apprequire('auth');
const debugRoutes = apprequire('routes/debug');
const Account     = apprequire('models/account');
const userRoutes  = apprequire('routes/user');

module.exports = () => {
  const passport = new Passport();
  recaptcha.init(config.get('recaptcha.site_key'), config.get('recaptcha.secret_key'));

  /* eslint-disable new-cap */
  const router   = express.Router();
  // setup passport authentication
  router.use(auth.middleware(passport));

  if (config.get('debug.routes')) {
    router.use('/debug', debugRoutes);
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

  router.get('/register', recaptcha.middleware.render, (req, res) => {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
      return;
    }
    res.render('register', {
      elements: {
        captcha: req.recaptcha,
      },
      messages: {
        error: req.flash('error')
      }
    });
  });

  router.post('/register', recaptcha.middleware.verify, (req, res) => {
    if (!req.recaptcha.error) {
      // just for testing, TODO: create view
      Account.register(
        new Account({
          username: req.body.username
        }),
        req.body.password,
        (regErr, account) => {
          if (!regErr) {
            auth.getUser('local', account._id, (err, user) => {
              if (err) return res.send(500);
              req.logIn(user, loginErr => {
                if (loginErr) res.send(500);
                // res.send('register successful');
                if (req.session.redirectedFrom) {
                  res.redirect(req.session.redirectedFrom);
                } else {
                  res.redirect('/dashboard');
                }
              });
            });
          } else {
            req.flash('error', regErr.message);
            res.redirect('/register');
          }
        }
      );
    } else {
      res.send(403); // TODO more verbosity
    }
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

  router.use('/user', userRoutes);

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

  return router;
};
