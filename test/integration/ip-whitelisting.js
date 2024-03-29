const config       = require('config');
const supertest    = require('supertest');

const requireFrom  = require('requirefrom');
const helpers      = requireFrom('test')('helpers');

describe('IP range filters', function() {
  describe('Application IP Whitelist', function() {
    let app;
    let request;
    
    describe('access from allowed', function() {
      before(function(done) {
        this.timeout(0); // setup can take a little longer if cold
        config.whitelist = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];
        helpers.disableLogging();
        helpers.app.promiseAppStateReloaded()
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
      
      it('respond without error', function(done) {
        request.get('/')
        .expect(res => {
          if (res.status < 400) {
            return;
          } else {
            return 'Server responded with status code ' + res.status;
          }
        })
        .end(done);
      });

      after(function(done) {
        //request.destroy();
        helpers.unmockgoose(done);
      });
    });
  });

  describe('Setuptool IP Whitelist', function() {
    let app;
    let request;
    
    before(function(done) {
      this.timeout(0); // setup can take a little longer if cold
      config.whitelist = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];
      helpers.disableLogging();
      requireFrom('server')('server')()
      .then(
        // get code to be tested after the environment is mocked
        server => {
          // create an app instance
          app = server
          request = supertest(app);
          done()
        }, done
      );
    });

    it('respond without error', function(done) {
      // TODO
      done();
    });

    after(function(done) {
      //request.destroy();
      helpers.unmockgoose(done);
    });
  });
});
