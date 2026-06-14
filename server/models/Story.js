const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    default: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
