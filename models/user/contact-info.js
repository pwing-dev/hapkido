const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ContactInfo = new Schema({
  type: String,
  id: String
});

module.exports = ContactInfo;
