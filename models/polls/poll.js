const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Poll = new Schema({
  options: [ObjectId],
  votes: [ObjectId]
});

module.exports = Schedule;
