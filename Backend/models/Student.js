const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: String,
  regdNo: { type: String, unique: true },
  course: String,
  branch: String
});

module.exports = mongoose.model('Student', StudentSchema);
