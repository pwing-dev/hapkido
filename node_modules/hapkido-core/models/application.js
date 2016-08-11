const findOrCreate = require('mongoose-findorcreate');
const randomstring = require('randomstring');
const mongoose     = require('mongoose');
const Schema       = require('mongoose').Schema;

const Application = new Schema({
  setupComplete: { type: Boolean, default: false },
  sessionSecret: { type: String, default: randomstring.generate(64) },
});
Application.plugin(findOrCreate);

module.exports = (() => {
  const State = mongoose.model('Application', Application);
  const injectState = (() => {
    let state;
    // cache an already resolved state
    const loadState = () => {
      state = new Promise((resolve, reject) => {
        State.findOrCreate({}, (err, doc) => {
          if (err) {
            reject(err);
            return;
          }
          state = doc;
          resolve(doc);
        });
      });
    };
    loadState();
    return (callback, forceReload) => {
      if (forceReload) loadState();
      Promise.resolve(state).then(val => callback(null, val), err => callback(err));
    };
  })();

  const makeSyncApi = state => ({
    isSetupComplete: () => state.setupComplete,
    getSessionSecret: () => state.sessionSecret
  });

  const API = {
    _forceReload: done => injectState(() => done(), true),
    assertInitialized: callback => injectState((err, state) => {
      if (err) {
        callback(err);
      } else {
        callback(null, makeSyncApi(state));
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
  const dummyApi = makeSyncApi();
  Object.keys(dummyApi).forEach(fun => {
    API[fun] = (...args) => {
      const callback = args.pop();
      API.promiseInitialized().then(api => callback(null, api[fun](...args)), callback);
    };
  });

  API.setSetupComplete = done => injectState((err, state) => {
    state.setupComplete = true;
    state.save(done);
  });
  return API;
})();
