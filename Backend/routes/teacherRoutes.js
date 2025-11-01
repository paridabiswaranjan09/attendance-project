const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');

router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  const teacher = await Teacher.findOne({ name, password });
  if (teacher) return res.json({ success: true, teacher });
  res.json({ success: false, message: "Invalid credentials" });
});

router.get('/list', async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
});

router.post('/add', async (req, res) => {
  const teacher = new Teacher(req.body);
  await teacher.save();
  res.json({ success: true });
});

router.delete('/remove/:id', async (req, res) => {
  await Teacher.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
