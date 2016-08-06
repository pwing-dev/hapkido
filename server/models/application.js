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

module.exports = {
  assertInitialized: callback => injectState(() => callback()),
  isSetupComplete: callback => injectState((err, state) => {
    if (err) {
      callback(err);
    } else {
      callback(null, state.setupComplete);
    }
  }),
  setSetupComplete: callback => injectState((err, state) => {
    if (err) return callback(err);
    state.setupComplete = true;
    return state.save(callback);
  }),
};
