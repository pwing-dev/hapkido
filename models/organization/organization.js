const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Organization = new Schema({
  name: String,
  offices: [ObjectId],
  services: [ObjectId],
  subscriptions: [ObjectId],
  contactInfos: [ObjectId]
});

module.exports = Organization;
