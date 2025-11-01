const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

router.post('/add', async (req, res) => {
  const complaint = new Complaint(req.body);
  await complaint.save();
  res.json({ success: true });
});

router.get('/view', async (req, res) => {
  const complaints = await Complaint.find();
  res.json(complaints);
});

router.delete('/remove/:id', async (req, res) => {
  await Complaint.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
