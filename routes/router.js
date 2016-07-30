const express  = require('express');
const passport = require('passport');
const auth     = require('../auth');

const router   = express.Router();

router.get('/login', (req, res) => {
  if (req.session.authenticated) {
    res.redirect('/dashboard');
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

router.get(auth.googleCallbackPath, 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
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
      res.redirect('/dashboard');
    }
    return;
  }

  req.session.authenticated   = false;
  req.session.loginFailed     = true;

  res.redirect('/login');
});


// protect all following routes
const protect = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    req.session.reqPreAuth = req.url; // store requested URL not allowed
    res.redirect('/login');
  }
}
router.use(protect);

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

module.exports = router;
