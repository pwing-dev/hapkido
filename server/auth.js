const config        = require('config');
const passport      = require('passport');
const GoogleAuth    = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const url           = require('url');
const urljoin       = require('url-join');
const ObjectId      = require('mongoose').Types.ObjectId;

const models        = require('requirefrom')('server/models');
const Account       = models('account');
const User          = models('user/user');

const baseUrl       = url.parse(config.get('baseURL'));
const googleCallbackPath = '/auth/google/callback';

module.exports = {
  getUser: (strategy, id, done) => User.findOrCreate({
    auth: {
      provider: strategy,
      id
    }
  }, (err, user) => done(err, user)),
  middleware: () => {
    // LOCAL Strategy
    const mongooseAuthenticator = Account.authenticate();
    passport.use(
      new LocalStrategy((username, password, done) =>
        mongooseAuthenticator(username, password, (authErr, profile, message) => {
          if (profile) { // login successful
            module.exports.getUser('local', profile._id, done);
          } else {
            done(authErr, false, message);
          }
        })
      )
    );

    // GOOGLE Strategy
    passport.use(new GoogleAuth(
      {
        clientID: config.get('auth.google.clientId'),
        clientSecret: config.get('auth.google.clientSecret'),
        callbackURL: urljoin(baseUrl.href, googleCallbackPath),
      },
      (accessToken, refreshToken, profile, done) =>
        module.exports.getUser('google', profile.id, done)
    ));

    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser((user, done) => User.findById(ObjectId(user), done));

    
    // Initialize Passport and restore authentication state, if any, from the
    // session.
    const ppInit = passport.initialize();
    const ppSession = passport.session();
    return (req, res, next) => {
      ppInit(req, res, err => {
        if (err) return next(err);
        ppSession(req, res, next);
      });
    };
  },
  googleCallbackPath
};
