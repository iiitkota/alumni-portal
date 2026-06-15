const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instituteId: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  personalEmail: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  graduationYear: { type: String, required: true },
  currentYear: { type: Number, min: 1, max: 4 },
  linkedin: { type: String },
  password: { type: String, required: true },
  profilePicture: { type: String },
  profilePicturePublicId: { type: String },
  role: { type: String, enum: ['student'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);
