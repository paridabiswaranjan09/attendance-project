const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const exists = await Admin.findOne({ name });
  if (exists) {
    return res.json({ success: false, message: "Admin already exists" });
  }
  const admin = new Admin({ name, email, phone, password });
  await admin.save();
  res.json({ success: true });
});

router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  const admin = await Admin.findOne({ name, password });
  if (admin) {
    res.json({ success: true, admin });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

module.exports = router;
