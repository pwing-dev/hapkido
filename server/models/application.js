const mongoose     = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema       = mongoose.Schema;

const Application = new Schema({
  setupComplete: { type: Boolean, default: false }
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
  isSetupComplete: callback => injectState((err, state) => err ? callback(err) : callback(null, state.setupComplete)),
  setSetupComplete: callback => injectState((err, state) => {
    if (err) return callback(err);
    state.setupComplete = true;
    state.save(callback);
  }),
};
