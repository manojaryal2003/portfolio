const express = require('express');
const router = express.Router();
const Hero = require('../models/Hero');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// @GET /api/hero
router.get('/', async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) {
      hero = await Hero.create({
        name: 'Full Stack Developer',
        title: 'Full Stack Developer & Project Manager',
        typingTexts: ['Full Stack Developer', 'MERN Stack Developer', 'Project Manager', 'Web Application Architect'],
        introduction: 'Passionate about building modern web applications and leading development teams at Smart IT Solution.',
      });
    }
    res.json({ success: true, data: hero });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/hero - Admin only
router.put('/', protect, async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) hero = new Hero();
    Object.assign(hero, req.body);
    await hero.save();
    res.json({ success: true, data: hero });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/hero/upload-image - Upload profile image
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    let hero = await Hero.findOne();
    if (!hero) hero = new Hero();
    if (hero.profileImagePublicId) {
      await cloudinary.uploader.destroy(hero.profileImagePublicId);
    }
    hero.profileImage = req.file.path;
    hero.profileImagePublicId = req.file.filename;
    await hero.save();
    res.json({ success: true, data: hero });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/hero/badges - Add a floating badge
router.post('/badges', protect, async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) hero = new Hero();
    const { label, value, color, order } = req.body;
    hero.floatingBadges.push({ label, value, color: color || 'indigo', order: order ?? hero.floatingBadges.length });
    await hero.save();
    res.json({ success: true, data: hero });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/hero/badges/:badgeId - Update a floating badge
router.put('/badges/:badgeId', protect, async (req, res) => {
  try {
    const hero = await Hero.findOne();
    if (!hero) return res.status(404).json({ success: false, message: 'Hero not found' });
    const badge = hero.floatingBadges.id(req.params.badgeId);
    if (!badge) return res.status(404).json({ success: false, message: 'Badge not found' });
    const { label, value, color, order } = req.body;
    if (label !== undefined) badge.label = label;
    if (value !== undefined) badge.value = value;
    if (color !== undefined) badge.color = color;
    if (order !== undefined) badge.order = order;
    await hero.save();
    res.json({ success: true, data: hero });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/hero/badges/:badgeId - Delete a floating badge
router.delete('/badges/:badgeId', protect, async (req, res) => {
  try {
    const hero = await Hero.findOne();
    if (!hero) return res.status(404).json({ success: false, message: 'Hero not found' });
    hero.floatingBadges = hero.floatingBadges.filter(b => b._id.toString() !== req.params.badgeId);
    await hero.save();
    res.json({ success: true, data: hero });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
