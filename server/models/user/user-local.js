const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const LocalUser = new Schema({
});

LocalUser.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', LocalUser);
