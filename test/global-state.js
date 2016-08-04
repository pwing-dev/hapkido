const mongoose     = require('mongoose');
const mockgoose    = require('mockgoose');
const chai         = require('chai');
const expect       = chai.expect;

describe('Global State', function() {
  let api;
  before(function(done) {
    this.timeout(0); // setup can take a little longer if cold
    mockgoose(mongoose).then(() => {
      mongoose.Promise = Promise;
      mongoose.connect('');
      api = require('requirefrom')('server/models')('global-state');
      done();
    }, done);
  });
  describe('check initialization', function() {
    it('is initially false', function(done) {
      api.isInitialized((err, initialized) => {
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
    mongoose.unmock();
  });
});
