const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Job = new Schema({
  type: ObjectId, // repeating or once
  time: String, // description of when the job is due. Interval or Date. TODO better type
  name: String,
  description: String,
  assignees: [ObjectId] // role or users
});

module.exports = Job;
