const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'Tools & Platforms', 'Other'],
    default: 'Other'
  },
  proficiency: { type: Number, default: 80, min: 0, max: 100 },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
