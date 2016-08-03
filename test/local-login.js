const proxyquire   = require('proxyquire');
const chai         = require('chai');
const supertest    = require('supertest');
const mongoose     = require('mongoose');
const mockgoose    = require('mockgoose');
const expect       = chai.expect;

const captchaResponse = '03AHJ_VuvX91Xbl1YlYf093zCTiyYCzBxbzfUxcbFm3aNr3tDjYLWGrTxgJKm62gThGu74QSs-JEzq4XTTpBVdjwEhaIMJUsbl2Utes8Df6DbAhJGQE_QkpNR3yTv10FTndzssZkqQAEKf7Q_Jwu3AGDNPekEV7ljU75HGTsHoXcncBlGUHwydn9wR3TmN8bOteYQLdgRCs8UKpOy4__IBcDK3zv651d35Ybf1aoudXbnGRI7eaucGnjVp7ZvEDDgDlHnrj4KLTm6tnU14cLPDDqDZBIADvhcDi6y6b7xxik5PSN-k6POg3EJd3la5mQh-Z2LWWCjVm8naulG0e0U6qt18JPgcodTquy6AVqgLcpkc33U2sIQ5ssiqkKQjmbXwMUnICtxanBUOZfs_N-cL86IfS97MfPLJule2z5ZikDu3uOavBwFGQ4O8TXI2_amlDhyqE0sxtZ5xnn3YxfAe3Ps6PlIU-r93-7RFp8227mXEo8ElG3lWp_8K1_Ak8nejS8ex0YZEGukZ2183PWL4ddGOnd6dzuotxZTO6SnRfF46Ae9RuBS5NCTPkOrbqr9QdgYQUv04OW-f3mO0nCl7dHdniu1Wbd4kTno0c7PL4EVm8rEhlUni8jT07y2TN1C8sV0cdtrRoQamlU5qnH6ED_3S5lBmJBky9QlV5x48PFs_Ez1f6hQit4YmM55JlXcyqqv8SuTW_0ObQ7N5oFH8NmvCUnev6StY5aiIT_W7AI_j7VDVCKdpIwIcWYIPpEYykYgDNAIkWo-7RuWBP_MAnas2BW0IXk-rHXVZizm8yzAk3PaydMJe-bCxT1EW7kcO65wHkP5tuh6YDPTbqD2RMVSk125yAsXSCwRIIHEngw4_UvMJVSNVtPAkCSsYh7euJUvY0NqEUDPVUR1dc8izpaP__TLtb_xQFRFXzMq_uT6pWrerUJOrcecHFjVaz-OEKm038XstG25gVwSmUfDaUJ7bIoCPHpBEgKlp0hnyR4-ujT5DMp_hE5g';

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
