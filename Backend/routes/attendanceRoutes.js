const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

router.post('/mark', async (req, res) => {
  const attendance = new Attendance(req.body);
  await attendance.save();
  res.json({ success: true });
});

router.post('/view', async (req, res) => {
  const { studentRegdNo, course, branch } = req.body;
  const attendance = await Attendance.find({ studentRegdNo, course, branch });
  res.json(attendance);
});

module.exports = router;
