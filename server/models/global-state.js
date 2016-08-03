const mongoose     = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema       = mongoose.Schema;

const GlobalState = new Schema({
  nextRoleId: {type: Number, default: 1000} // first 1000 roles are reserved
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
  acquireNewRoleId: callback => {
    injectState((err1, state) => {
      if (err1) {
        callback(err1);
        return;
      }
      const id = state.nextRoleId++;
      state.save(err2 => {
        if (err2) {
          callback(err2);
          return;
        }
        callback(null, id);
      });
    });
  }
};