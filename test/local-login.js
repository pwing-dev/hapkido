const proxyquire   = require('proxyquire');
const chai         = require('chai');
const supertest    = require('supertest');
const mongoose     = require('mongoose');
const mockgoose    = require('mockgoose');
const expect       = chai.expect;

// ATTENTION mocha binds `this` to some test case object, but this doesn't
// work with (arrow) => {functions}. So please use normal function s() {}
// everywhere. Thank you

describe('Local login', function() {
  let Account;
  let app;
  let request;
  before(function(done) {
    this.timeout(0); // setup can take a little longer if cold
    mockgoose(mongoose)
      .then(
        () => {
          const mockgooserequirefrom = proxyquire('requirefrom', { 'mongoose': mongoose });
          Account = mockgooserequirefrom('server/models')('account');
          // create an app instance
          return mockgooserequirefrom('server')('server')();
        }, e => Promise.reject(e)
      ).then(server => { app = server; request = supertest(app); done() }, done);
  });
  describe('server', function() {
    let cookies;
    it('register a test user', function(done) {
      request
        .post('/register')
        .type('form')
        .send({username: 'test', password: 'test'})
        //~ .expect('redirect', true)
        //~ .expect('status', 302)
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
        .send({username: 'test', password: 'test'})
        .expect('location', '/register')
        .end(done);
    });
    it('no registration or login required', function(done) {
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
  });
});
