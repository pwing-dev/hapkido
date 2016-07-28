const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Asset = new Schema({
  type: String,
  path: String
});

module.exports = Asset;
