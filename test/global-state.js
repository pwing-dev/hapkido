const proxyquire   = require('proxyquire');
const mongoose     = require('mongoose');
const mockgoose    = require('mockgoose');
const chai         = require('chai');
const expect       = chai.expect;

describe('Global state api', function() {
  let stateApi;
  before(function() {
    const mockgooserequirefrom = proxyquire('requirefrom', { 'mongoose': mongoose });
    stateApi = mockgooserequirefrom('server/models')('global-state');
  });
  describe('Role IDs', function() {
    it('start with 1000', function() {
      stateApi.acquireNewRoleId((err, id) => {
        expect(err).to.be.null;
        expect(id).to.equal(1000);
      });
    });
    it('have 1001 next', function() {
      stateApi.acquireNewRoleId((err, id) => {
        expect(err).to.be.null;
        expect(id).to.equal(1001);
      });
    });
  });
});
