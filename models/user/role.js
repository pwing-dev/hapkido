const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Role = new Schema({
  name: String,
  visibility: String
});

module.exports = Role;
