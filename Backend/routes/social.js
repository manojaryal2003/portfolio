const express = require('express');
const router = express.Router();
const Social = require('../models/Social');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const socials = await Social.find({ isActive: true }).sort('order');
    res.json({ success: true, data: socials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const socials = await Social.find().sort('order');
    res.json({ success: true, data: socials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const social = await Social.create(req.body);
    res.status(201).json({ success: true, data: social });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const social = await Social.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!social) return res.status(404).json({ success: false, message: 'Social not found' });
    res.json({ success: true, data: social });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Social.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Social deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
