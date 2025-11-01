const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

router.get('/list', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

router.post('/add', async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json({ success: true });
});

router.delete('/remove/:id', async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
