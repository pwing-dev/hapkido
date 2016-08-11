const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactInfo = new Schema({
  type: String,
  id: String,
  visibility: String,
  attributes: [String] // e.g. ['whatsapp=true', 'telegram=true']
});

module.exports = ContactInfo;
