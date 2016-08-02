const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Request = new Schema({
  sender: ObjectId,
  receiver: ObjectId,
  subject: ObjectId,
  message: String,
  status: String // 'pending', 'accepted' or 'declined'
});

module.exports = Request;
