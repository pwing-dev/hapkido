const express    = require('express');

/* eslint-disable new-cap */
const debug      = express.Router();

debug.get('/status', (req, res) => res.render('debug/status', {
  layout: false,
  req,
  res
}));

module.exports = debug;
