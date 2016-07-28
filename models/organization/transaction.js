const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Transaction = new Schema({
  quantity: ObjectId,
  difference: Number,
  timestamp: Date,
  description: String
});

module.exports = Transaction;
