const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  course: String,
  branch: String
});

module.exports = mongoose.model('Teacher', TeacherSchema);
