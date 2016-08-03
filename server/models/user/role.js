const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Role = new Schema({
  id: Number,
  name: String,
  visibility: String
});

module.exports = mongoose.model('Role', Role);
