const mongoose = require('mongoose');

const ReferralMessageSchema = new mongoose.Schema({
  referralRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralRequest',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['student', 'alumni']
  },
  text: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReferralMessage', ReferralMessageSchema);
