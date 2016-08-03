const express    = require('express');
const config     = require('config');

const apprequire = require('requirefrom')('server');
const Request    = apprequire('models/organization/request');

/* eslint-disable new-cap */
const user   = express.Router();

// user is mounted at /user/*

user.get('/setup', (req, res) => {
  res.render('user/setup', {
    heading: 'Account Setup',
    layout: 'panel'
  });
});

user.post('/setup', (req, res) => {
  if (req.user.initialized) {
    res.send(403); // TODO: .render('error403');
  } else {
    req.user = {
      initialized: true,
      displayName: req.body.displayName,
    };
    req.user.save();
    Request.create({
      sender: req.user._id,
      // subject: TODO,
      message: `${res.user.displayName} wants to lease ${req.body.room}`,
      status: 'pending',
    }, (err) => {
      if (err) {
        res.send(500); // TODO .render('error500');
      } else {
        res.redirect('/dashboard');
      }
    });
  }
});

module.exports = user;
