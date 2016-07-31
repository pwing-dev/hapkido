const config     = require('config');
const passport   = require('passport');
const GoogleAuth = require('passport-google-oauth20').Strategy;
const url        = require('url');
const urljoin    = require('url-join');

const baseUrl    = url.parse(config.get('server.baseURL'));
const googleCallbackPath = urljoin(baseUrl.href, '/auth/google/callback');

passport.use(new GoogleAuth({
  clientID: config.get('server.auth.google.clientId'),
  clientSecret: config.get('server.auth.google.clientSecret'),
  callbackURL: googleCallbackPath,
},
(accessToken, refreshToken, profile, cb) => {
  // TODO find user in our database and do the mapping
  //User.findOrCreate({ googleId: profile.id }, function (err, user) {
  return cb(null, profile);
  //});
}
));

// TODO see https://github.com/passport/express-4.x-facebook-example/blob/master/server.js#L28
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
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
