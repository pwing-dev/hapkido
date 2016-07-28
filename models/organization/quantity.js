const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Quantity = new Schema({
  name: String,
  media: [ObjectId], // Assets
  amount: Number
});

module.exports = Quantity;
