const mongoose     = require('mongoose');
const mockgoose    = require('mockgoose');
const chai         = require('chai');
const expect       = chai.expect;

describe('Role', function() {
  let role;
  before(function(done) {
    mockgoose(mongoose).then(() => {
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
});
