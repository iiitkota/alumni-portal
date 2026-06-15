const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  coverImage: { type: String },
  coverImagePublicId: { type: String },
  tags: [{ type: String, trim: true }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: { type: String, required: true },
  authorProfilePicture: { type: String, default: '' },
  authorCurrentCompany: { type: String, default: '' },
  authorRole: { type: String, default: '' },
  authorGraduationYear: { type: String, default: '' },
  postedBy: {
    type: { type: String, enum: ['alumni', 'admin'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ title: 'text', authorName: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', BlogSchema);
