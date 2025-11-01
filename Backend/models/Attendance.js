const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentRegdNo: String,
  date: String,
  status: String,
  course: String,
  branch: String
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
