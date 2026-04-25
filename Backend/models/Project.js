const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  images: [{ url: { type: String }, publicId: { type: String } }],
  video: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  category: {
    type: String,
    enum: ['Web Applications', 'E-commerce', 'Admin Dashboards', 'Mobile Apps', 'Client Projects', 'Other'],
    default: 'Web Applications'
  },
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  completionDate: { type: Date },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
