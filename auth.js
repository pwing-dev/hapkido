const config     = require('config');
const passport   = require('passport');
const GoogleAuth = require('passport-google-oauth20').Strategy;

const getSiteUrl = () => {
  const https  = config.get('server.https');
  const proto  = https ? 'https' : 'http';
  let   domain = config.get('server.domain');
  // xip.io gives our dev server a public domain which makes google happy
  if (domain === 'localhost' || domain === '127.0.0.1') {
    domain = '127.0.0.1.xip.io';
  }
  let   port   = `:${config.get('server.port')}`;
  if ((https && port === ':443') || (!https && port === ':80')) {
    port = '';
  }
  let   url    = `${proto}://${domain}${port}`;
  return url;
};

const googleCallbackPath = '/auth/google/callback';
passport.use(new GoogleAuth({
    clientID: config.get('server.auth.google.clientId'),
    clientSecret: config.get('server.auth.google.clientSecret'),
    callbackURL: `${getSiteUrl()}${googleCallbackPath}`
  },
  function(accessToken, refreshToken, profile, cb) {
    // TODO find user in our database and do the mapping
    //User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(null, profile);
    //});
  }
));

// TODO see https://github.com/passport/express-4.x-facebook-example/blob/master/server.js#L28
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
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
}
