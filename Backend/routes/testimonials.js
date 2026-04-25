const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort('order');
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort('order');
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.photo = req.file.path;
      data.photoPublicId = req.file.filename;
    }
    const testimonial = await Testimonial.create(data);
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, upload.single('photo'), async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    const data = { ...req.body };
    if (req.file) {
      if (t.photoPublicId) await cloudinary.uploader.destroy(t.photoPublicId);
      data.photo = req.file.path;
      data.photoPublicId = req.file.filename;
    }
    const updated = await Testimonial.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    if (t.photoPublicId) await cloudinary.uploader.destroy(t.photoPublicId);
    await t.deleteOne();
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
