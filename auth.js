const config        = require('config');
const passport      = require('passport');
const GoogleAuth    = require('passport-google-oauth20').Strategy;
const url           = require('url');
const urljoin       = require('url-join');
const LocalUser     = require('./models/user/user-local.js');
const LocalStrategy = require('passport-local').Strategy;
const User          = require('./models/user/user.js');

const baseUrl       = url.parse(config.get('server.baseURL'));
const googleCallbackPath = '/auth/google/callback';

// LOCAL Strategy
passport.use(new LocalStrategy(LocalUser.authenticate()));

// GOOGLE Strategy
passport.use(new GoogleAuth(
  {
    clientID: config.get('server.auth.google.clientId'),
    clientSecret: config.get('server.auth.google.clientSecret'),
    callbackURL: urljoin(baseUrl.href, googleCallbackPath),
  },
  (accessToken, refreshToken, profile, cb) => {
    // TODO find user in our database and do the mapping
    // User.findOrCreate({
    //  googleId: profile.id
    // }, (err, user) => {
    return cb(null, profile);
    // });
  }
));

// TODO see https://github.com/passport/express-4.x-facebook-example/blob/master/server.js#L28
passport.serializeUser((user, cb) => {
  if (user.provider === 'local') {
    return LocalUser.serializeUser()(user, cb);
  } else if (user.provider === 'google') {
    cb(null, user);
  } else {

  }
});

passport.deserializeUser((user, cb) => {
  console.log(user);
  if (user.provider === 'local') {
    return LocalUser.deserializeUser()(user, cb);
  } else if (user.provider === 'google') {
    cb(null, user);
  }
});

module.exports = {
  init: app => {
    // Initialize Passport and restore authentication state, if any, from the
    // session.
    app.use(passport.initialize());
    app.use(passport.session());
  },
  googleCallbackPath
};
