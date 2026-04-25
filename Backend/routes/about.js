const express = require('express');
const router = express.Router();
const About = require('../models/About');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = await About.create({
        description: 'Full Stack Developer & Project Manager at Smart IT Solution.',
        role: 'Full Stack Developer & Project Manager',
        company: 'Smart IT Solution',
        expertise: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'Project Management'],
      });
    }
    res.json({ success: true, data: about });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/', protect, async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) about = new About();
    Object.assign(about, req.body);
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    let about = await About.findOne();
    if (!about) about = new About();
    if (about.profileImagePublicId) {
      await cloudinary.uploader.destroy(about.profileImagePublicId);
    }
    about.profileImage = req.file.path;
    about.profileImagePublicId = req.file.filename;
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
