const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Role = new Schema({
  name: String,
  visibility: String
});

module.exports = Role;
