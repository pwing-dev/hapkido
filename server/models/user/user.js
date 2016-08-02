const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const User = new Schema({
  auth: {
    provider: String,
    id: String
  },
  initialized: Boolean,
  displayName: String,
  room: String,
  avatar: ObjectId, // Asset
  organizations: [ObjectId],
  roles: [ObjectId],
  services: [ObjectId],
  subscriptions: [ObjectId],
  contactInfos: [ObjectId]
});

module.exports = User;
