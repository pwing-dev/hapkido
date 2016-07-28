const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Balance = new Schema({
  transactions: [ObjectId]
});

module.exports = Balance;
