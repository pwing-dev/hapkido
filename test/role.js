const chai         = require('chai');
const expect       = chai.expect;
const helpers      = require('./helpers');

describe('Role', function() {
  let role;
  before(function(done) {
    
    this.timeout(0); // setup can take a little longer if cold
    helpers.mockgoose(true).then(() => {
      role = require('requirefrom')('server/models/user')('role');
      done();
    }, done);
  });
  describe('get admin role', function() {
    it('is special and named', function(done) {
      role.findAdmin((err, admin) => {
        try {
          expect(admin).to.have.property('_specialGlobal').that.is.not.equal(0);
          expect(admin).to.have.property('name', 'admin');
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
