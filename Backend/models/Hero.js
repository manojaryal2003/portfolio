const mongoose = require('mongoose');

const FloatingBadgeSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  color: { type: String, default: 'indigo' }, // indigo | purple | green | orange | pink
  order: { type: Number, default: 0 },
}, { _id: true });

const HeroSchema = new mongoose.Schema({
  name: { type: String, default: 'Your Name' },
  title: { type: String, default: 'Full Stack Developer & Project Manager' },
  typingTexts: [{ type: String }],
  introduction: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  profileImagePublicId: { type: String, default: '' },
  cvUrl: { type: String, default: '' },
  cvPublicId: { type: String, default: '' },
  floatingBadges: { type: [FloatingBadgeSchema], default: [
    { label: 'Experience', value: '5+ Years', color: 'indigo', order: 0 },
    { label: 'Projects', value: '50+', color: 'purple', order: 1 },
  ]},
}, { timestamps: true });

module.exports = mongoose.model('Hero', HeroSchema);
