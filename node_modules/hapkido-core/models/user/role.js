const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-findorcreate');

const SPECIAL_GLOBAL_ROLES = {
  GOD: 1,
  ADMIN: 10,
};


const Role = new Schema({
  _specialGlobal: {type: Number, default: 0},
  name: String,
  visibility: String
});

Role.plugin(findOrCreate);
Role.statics.findAdmin = function(callback) {
  this.findOrCreate({_specialGlobal: SPECIAL_GLOBAL_ROLES.ADMIN, name: 'admin', visibility: 'private'}, (err, doc) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, doc);
  });
};

module.exports = mongoose.model('Role', Role);
