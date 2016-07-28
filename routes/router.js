const express = require('express');

const router  = express.Router();

router.get('/login', (req, res) => {
  res.send('test');
});

router.get('/', (req, res) => {
  res.render('dashboard');
});

module.exports = router;
