const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema({
  instituteId: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isExistingUser: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema); 