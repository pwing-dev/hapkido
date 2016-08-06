const chai         = require('chai');
const expect       = chai.expect;
const helpers      = require('./helpers');

describe('Application', function() {
  let api;
  before(function(done) {
    this.timeout(0); // setup can take a little longer if cold
    helpers.mockgoose(true).then(() => {
      api = require('requirefrom')('server/models')('application');
      done();
    }, done);
  });
  describe('check initialization', function() {
    it('is initially false', function(done) {
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
  after(function() {
    helpers.unmockgoose();
  });
});
