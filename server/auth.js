const config        = require('config');
const passport      = require('passport');
const GoogleAuth    = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const url           = require('url');
const urljoin       = require('url-join');

const Account       = require('hapkido/server/models/account');
const User          = require('hapkido/server/models/user/user');

const baseUrl       = url.parse(config.get('server.baseURL'));
const googleCallbackPath = '/auth/google/callback';

// LOCAL Strategy
const mongooseAuthenticator = Account.authenticate();
passport.use(
  new LocalStrategy((username, password, done) =>
    mongooseAuthenticator(username, password, (err, profile, message) => {
      if (profile) { // login successful
        User.findOrCreate(
          {
            auth: {
              provider: 'local',
              id: profile._id // TODO we can use username here as well. Which do we prefer?
            }
          }, (err, user, created) => done(err, user)
        );
      } else {
        done(null, false, message);
      }
    })
  )
);

// GOOGLE Strategy
passport.use(new GoogleAuth(
  {
    clientID: config.get('server.auth.google.clientId'),
    clientSecret: config.get('server.auth.google.clientSecret'),
    callbackURL: urljoin(baseUrl.href, googleCallbackPath),
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOrCreate(
      {
        auth: {
          provider: 'google',
          id: profile.id
        }
      }, (err, user, created) => done(err, user)
    );
  }
));

// TODO see https://github.com/passport/express-4.x-facebook-example/blob/master/server.js#L28
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((user, cb) => {
  return User.findById(user, cb);
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
