const mongoose     = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema       = mongoose.Schema;
const ObjectId     = Schema.Types.ObjectId;

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
User.plugin(findOrCreate);

module.exports = mongoose.model('User', User);
