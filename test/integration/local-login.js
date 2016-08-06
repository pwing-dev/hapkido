const config       = require('config');
const supertest    = require('supertest');

const requireFrom  = require('requirefrom');
const helpers      = requireFrom('test')('helpers');

// ATTENTION mocha binds `this` to some test case object, but this doesn't
// work with (arrow) => {functions}. So please use normal function s() {}
// everywhere. Thank you

describe('Local login', function() {
  let captchaResponse;
  let app;
  let request;
  let cookies;
  before(function(done) {
    captchaResponse = helpers.grecaptchaTestMode();
    this.timeout(0); // setup can take a little longer if cold
    helpers.disableLogging();
    helpers.mockgoose(true) // mock mongoose
    .then(
      helpers.app.promiseSetupComplete,
      e => Promise.reject(e)
    ).then(
      requireFrom('server')('server'), // use the createServer() function as callback
      e => Promise.reject(e)
    ).then(
      // get code to be tested after the environment is mocked
      server => {
        // create an app instance
        app = server
        request = supertest(app);
        done()
      }, done
    );
  });
  it('can register a test user', function(done) {
    request
      .post('/register')
      .type('form')
      .send({
        username: 'test',
        password: 'test',
        'g-recaptcha-response': captchaResponse,
      })
      .expect('location', '/dashboard')
      .end((err, res) => {
        if (!err) {
          // see this gist https://gist.github.com/joaoneto/5152248
          cookies = res.headers['set-cookie']
            .map(r => r.replace(new RegExp('; path=/; httponly', 'gi'), ''))
            .join('; ');
        }
        done(err);
      });
  });
  it('cannot create the same user twice', function(done) {
    request
      .post('/register')
      .type('form')
      .send({
        username: 'test',
        password: 'test',
        'g-recaptcha-response': captchaResponse,
      })
      .expect('location', '/register')
      .end(done);
  });
  it('no login required after registration', function(done) {
    request.get('/register')
      .set('Cookie', cookies)
      .expect('location', '/dashboard')
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        request.get('/login')
          .set('Cookie', cookies)
          .expect('location', '/dashboard')
          .end(done);
      });
  });
  after(function(done) {
    //request.destroy();
    helpers.unmockgoose(done);
  });
});
