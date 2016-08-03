const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-findorcreate');

const RESERVED_IDS = {
  GOD: 0,
  ADMIN: 10,
};


const Role = new Schema({
  id: Number,
  name: String,
  visibility: String
});

Role.plugin(findOrCreate);
Role.statics.findAdmin = function(callback) {
  this.findOrCreate({id: RESERVED_IDS.ADMIN}, (err, doc) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, doc);
  });
};

module.exports = mongoose.model('Role', Role);
