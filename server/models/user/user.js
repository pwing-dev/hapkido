const mongoose     = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema       = mongoose.Schema;
const ObjectId     = Schema.Types.ObjectId;

const User = new Schema({
  auth: {
    provider: String,
    id: String
  },
  initialized: {type: Boolean, default: false},
  displayName: String,
  room: ObjectId, // a Lease for a room
  avatar: ObjectId, // Asset
  organizations: [ObjectId],
  roles: [{type: ObjectId, ref: 'Role'}],
  services: [ObjectId],
  subscriptions: [ObjectId],
  contactInfos: [ObjectId],
  leases: [ObjectId]
});
User.plugin(findOrCreate);

module.exports = mongoose.model('User', User);
