const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Asset = new Schema({
  type: String,
  path: String
});

module.exports = Asset;
