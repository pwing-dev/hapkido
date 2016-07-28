const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Balance = new Schema({
  transactions: [ObjectId],
  state: [ObjectId] // array of quantities which describe the current state of this balance
});

module.exports = Balance;
