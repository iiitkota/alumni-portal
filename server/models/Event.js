const mongoose = require('mongoose')


const ImageSchema = new mongoose.Schema({
  uid: { type: String, required: true }, // Required field example
  path: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: String,
  size: { type: Number, min: 0 }, // Validation example
  mimetype: String
});

// Event Post Schema
const EventPostSchema = new mongoose.Schema({
  title: String,
  description: String,
  details: String,
  date: Date,
  images: [ImageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports  = mongoose.model('Event', EventPostSchema);