const express = require('express');
const router = express.Router();
const Stat = require('../models/Stat');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const stats = await Stat.find().sort('order');
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const stat = await Stat.create(req.body);
    res.status(201).json({ success: true, data: stat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const stat = await Stat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!stat) return res.status(404).json({ success: false, message: 'Stat not found' });
    res.json({ success: true, data: stat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Stat.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stat deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
