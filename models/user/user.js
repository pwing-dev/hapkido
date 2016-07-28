const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const User = new Schema({
  provider: String,
  id: String,
  displayName: String,
  avatar: ObjectId,
  organizations: [ObjectId],
  roles: [ObjectId],
  services: [ObjectId],
  subscriptions: [ObjectId],
  contactInfos: [ObjectId]
});

module.exports = User;
