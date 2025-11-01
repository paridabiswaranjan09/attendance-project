const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: String,
  phone: String,
  password: { type: String, required: true }
});

module.exports = mongoose.model('Admin', AdminSchema);
