const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: 'Present' },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, default: '' },
  responsibilities: [{ type: String }],
  technologies: [{ type: String }],
  companyLogo: { type: String, default: '' },
  companyLogoPublicId: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Experience', ExperienceSchema);
