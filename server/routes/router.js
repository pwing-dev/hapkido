const express   = require('express');
const passport  = require('passport');

const auth      = require('hapkido/server/auth');
const Account = require('hapkido/server/models/account');

/* eslint-disable new-cap */
const router   = express.Router();

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
  passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login' })
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
          res.redirect('/dashboard');
        });
      } else {
        console.log(err, account);
        req.flash('error', err.message);
        res.redirect('register');
      }
    }
  );
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

router.get(auth.googleCallbackPath,
  passport.authenticate('google', { successRedirect: '/dashboard', failureRedirect: '/login' })
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
    next();
  } else {
    console.log('Accessing a protected route although not authenticated');
    req.session.reqPreAuth = req.url; // store requested URL not allowed
    res.redirect('/login');
  }
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

module.exports = router;
