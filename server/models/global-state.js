const mongoose     = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema       = mongoose.Schema;

const GlobalState = new Schema({
  setupComplete: {type: Boolean, default: false}
});
GlobalState.plugin(findOrCreate);

const State = mongoose.model('GlobalState', GlobalState);
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
};
