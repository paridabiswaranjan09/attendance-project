const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

router.get('/list', async (req, res) => {
  const branches = await Branch.find();
  res.json(branches);
});

router.post('/add', async (req, res) => {
  const branch = new Branch(req.body);
  await branch.save();
  res.json({ success: true });
});

router.delete('/remove/:id', async (req, res) => {
  await Branch.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
