const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Service = new Schema({
  visibility: String,
  description: String,
  name: String
});

module.exports = Service;
