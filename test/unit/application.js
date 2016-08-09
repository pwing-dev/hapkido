const chai         = require('chai');
const expect       = chai.expect;
const helpers      = require('../helpers');

describe('Application', function() {
  let api;
  before(function(done) {
    this.timeout(0); // setup can take a little longer if cold
    helpers.app.promiseAppStateReloaded()
    .then(() => {
      api = require('requirefrom')('server/models')('application');
      done();
    }, done);
  });
  describe('check setup status', function() {
    it('is initially not set up', function(done) {
      api.isSetupComplete((err, initialized) => {
        try {
          expect(err).to.be.null;
          expect(initialized).to.equal(false);
          done();
        } catch(e) {
          done(e);
        }
      });
    });
  });
  after(function(done) {
    helpers.unmockgoose(done);
  });
});
