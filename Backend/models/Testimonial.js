const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, default: '' },
  message: { type: String, required: true },
  photo: { type: String, default: '' },
  photoPublicId: { type: String, default: '' },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
