const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Vote = new Schema({
  option: ObjectId,
  voter: ObjectId
});

module.exports = Vote;
