const express    = require('express');
const config     = require('config');

const apprequire = require('requirefrom')('server');
const Request    = apprequire('models/organization/request');
const User       = apprequire('models/user/user');

/* eslint-disable new-cap */
const user   = express.Router();

// user is mounted at /user/*

user.get('/setup', (req, res) => {
  if (req.user.initialized) {
    res.send(403);
  } else {
    res.render('user/setup', {
      heading: 'Account Setup',
      layout: 'panel'
    });
  }
});

user.post('/setup', (req, res) => {
  if (req.user.initialized) {
    res.send(403); // TODO: .render('error403');
  } else {
    req.user.initialized = true;
    req.user.displayName = req.body.displayName;
    if (!req.user.save) {
      // TODO I still think this is a bug
      console.log('Setting up user without save method', req.user);
    }
    User.findByIdAndUpdate(req.user._id, req.user, err => {
      if (err) {
        return res.send(500);
      }
      Request.create({
        sender: req.user._id,
        // subject: TODO,
        message: `${req.user.displayName} wants to lease ${req.body.room}`,
        status: 'pending',
      }, err => {
        if (err) {
          res.send(500); // TODO .render('error500');
        } else {
          res.redirect('/dashboard');
        }
      });
    });
  }
});

module.exports = user;
