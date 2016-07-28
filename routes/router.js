const express = require('express');

const router  = express.Router();

router.get('/login', (req, res) => {
  if (req.session.authentificated) {
    res.redirect('/dashboard');
    return;
  }
  res.render('login', {
    loginFailed: (req.session.loginFailed || false),
    heading: 'Log In',
    layout: 'panel',
  });
});

router.post('/login', (req, res) => {
  // TODO: replace with passport
  if (req.body.username === 'test' && req.body.password === 'test') {
    req.session.user_name       = 'test';
    req.session.user_id         = '0';
    req.session.authentificated = true;
    req.session.loginFailed     = false;

    if (req.session.reqPreAuth) {
      res.redirect(req.session.reqPreAuth);
    } else {
      res.redirect('/dashboard');
    }
    return;
  }

  req.session.authentificated = false;
  req.session.loginFailed     = true;

  res.redirect('/login');
});


// protect all following routes
function auth(req, res, next) {
  if (req.session.authentificated) {
    next();
  } else {
    req.session.reqPreAuth = req.url; // store requested URL not allowed
    res.redirect('/login');
  }
}

router.use(auth);

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

module.exports = router;
