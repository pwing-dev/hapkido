const mongoose       = require('mongoose');
const Schema         = mongoose.Schema;
const passportPlugin = require('passport-local-mongoose');

const Account = new Schema({});
Account.plugin(passportPlugin);

module.exports = mongoose.model('Account', Account);
