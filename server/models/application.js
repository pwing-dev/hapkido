const mongoose     = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const randomstring = require('randomstring');
const Schema       = mongoose.Schema;

const Application = new Schema({
  setupComplete: { type: Boolean, default: false },
  sessionSecret: { type: String, default: randomstring.generate(64) },
});
Application.plugin(findOrCreate);

const State = mongoose.model('Application', Application);
const injectState = (() => {
  // cache an already resolved state
  let state = new Promise((resolve, reject) => {
    State.findOrCreate({}, (err, doc) => {
      if (err) {
        reject(err);
        return;
      }
      state = doc;
      resolve(doc);
    });
  });
  return callback => {
    Promise.resolve(state).then(val => callback(null, val), err => callback(err));
  };
})();

const makeApi = state => ({
  isSetupComplete: () => state.setupComplete,
  setSetupComplete: () => { state.setupComplete = true; },
  getSessionSecret: () => state.session.secret
});

module.exports = {
  assertInitialized: callback => injectState((err, state) => {
    if (err) {
      callback(err);
    } else {
      callback(null, makeApi(state));
    }
  }),
  promiseInitialized: () => new Promise((resolve, reject) => {
    module.exports.assertInitialized((err, api) => {
      if (err) {
        reject(err);
      } else {
        resolve(api);
      }
    });
  })
};

// generate asynchronous api
const dummyApi = makeApi();
Object.keys(dummyApi).forEach(fun => {
  module.exports[fun] = (...args) => {
    const callback = args.pop();
    module.exports.promiseInitialized().then(api => callback(null, api[fun](...args)), callback);
  };
});
