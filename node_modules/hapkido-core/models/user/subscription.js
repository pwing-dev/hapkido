const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Subscription = new Schema({
  producer: ObjectId,
  consumer: ObjectId
});

module.exports = Subscription;
