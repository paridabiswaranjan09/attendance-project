const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  studentRegdNo: String,
  date: String,
  text: String
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
