const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  category: { type: String, default: 'Web Development' },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  slug: { type: String, unique: true },
}, { timestamps: true });

BlogSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Blog', BlogSchema);
