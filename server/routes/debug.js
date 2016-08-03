const express    = require('express');
const role       = require('requirefrom')('server/models')('user/role');

/* eslint-disable new-cap */
const debug      = express.Router();

debug.get('/status', (req, res) => res.render('debug/status', {
  layout: false,
  req,
  res
}));

debug.get('/admin', (req, res) => {
  role.findAdmin((err, admin) => {
    if (err) {
      res.send(500);
      return;
    }
    const data = {
      layout: false,
      user: req.user
    };
    console.log(admin._id);
    if (req.user && req.user.roles.find(role => role.toHexString() === admin._id.toHexString())) {
      data.isAdmin = true;
    }
    res.render('debug/admin', data); 
  });
});

debug.post('/admin', (req, res) => {
  role.findAdmin((err, admin) => {
    if (!req.user) {
      res.send(403);
      return;
    }
    if (req.body.escalate && !(req.user.roles.find(role => role.toHexString() === admin._id.toHexString()))) {
      req.user.roles.push(admin);
    }
    if (req.body.deescalate) {
      req.user.roles = req.user.roles.filter(role => role.toHexString() !== admin._id.toHexString());
    }
    req.user.save(err => {
      if (err) {
        res.send(500);
        return;
      }
      res.redirect('/debug/admin');
    });
  });
});

module.exports = debug;
