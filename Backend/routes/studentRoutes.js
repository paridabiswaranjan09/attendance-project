const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

router.post('/login', async (req, res) => {
  const { regdNo } = req.body;
  const student = await Student.findOne({ regdNo });
  if (student) return res.json({ success: true, student });
  res.json({ success: false, message: "Student not found" });
});

router.get('/list', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

router.post('/add', async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json({ success: true });
});

router.delete('/remove/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
