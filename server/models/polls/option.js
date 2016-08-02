const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Option = new Schema({
  parent: ObjectId,
  name: String,
  description: String
});

module.exports = Option;
