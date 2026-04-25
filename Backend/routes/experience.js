const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

router.get('/', async (req, res) => {
  try {
    const experience = await Experience.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: experience });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, upload.single('logo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.body.responsibilities) {
      data.responsibilities = typeof req.body.responsibilities === 'string'
        ? JSON.parse(req.body.responsibilities) : req.body.responsibilities;
    }
    if (req.body.technologies) {
      data.technologies = typeof req.body.technologies === 'string'
        ? JSON.parse(req.body.technologies) : req.body.technologies;
    }
    if (req.file) {
      data.companyLogo = req.file.path;
      data.companyLogoPublicId = req.file.filename;
    }
    const exp = await Experience.create(data);
    res.status(201).json({ success: true, data: exp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, upload.single('logo'), async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found' });
    const data = { ...req.body };
    if (req.body.responsibilities) {
      data.responsibilities = typeof req.body.responsibilities === 'string'
        ? JSON.parse(req.body.responsibilities) : req.body.responsibilities;
    }
    if (req.body.technologies) {
      data.technologies = typeof req.body.technologies === 'string'
        ? JSON.parse(req.body.technologies) : req.body.technologies;
    }
    if (req.file) {
      if (exp.companyLogoPublicId) await cloudinary.uploader.destroy(exp.companyLogoPublicId);
      data.companyLogo = req.file.path;
      data.companyLogoPublicId = req.file.filename;
    }
    const updated = await Experience.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found' });
    if (exp.companyLogoPublicId) await cloudinary.uploader.destroy(exp.companyLogoPublicId);
    await exp.deleteOne();
    res.json({ success: true, message: 'Experience deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
