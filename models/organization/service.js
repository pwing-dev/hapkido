const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Service = new Schema({
  visibility: String,
  description: String,
  name: String
});

module.exports = Service;
