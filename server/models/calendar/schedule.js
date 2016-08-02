const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Schedule = new Schema({
  jobs: [ObjectId]
});

module.exports = Schedule;
