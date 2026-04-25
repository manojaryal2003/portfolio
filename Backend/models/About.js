const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  profileImagePublicId: { type: String, default: '' },
  role: { type: String, default: '' },
  company: { type: String, default: 'Smart IT Solution' },
  experience: { type: String, default: '' },
  expertise: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);
