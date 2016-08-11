const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Broadcast = new Schema({
  message: String,
  audience: [ObjectId]
});

module.exports = Broadcast;
