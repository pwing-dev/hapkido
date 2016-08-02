const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Lease = new Schema({
  name: String,
  lessor: ObjectId,
  leaser: ObjectId,
  description: String
});

module.exports = Lease;
