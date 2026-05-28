const mongoose = require('mongoose');

const ReferralRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  resumePublicId: {
    type: String,
    required: true
  },
  jobLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'withdrawn'],
    default: 'pending'
  },
  alumniMessage: {
    type: String
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  withdrawnAt: {
    type: Date
  },
  studentSeen: {
    type: Boolean,
    default: false
  },
  alumniSeen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

ReferralRequestSchema.index(
  { student: 1, company: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('ReferralRequest', ReferralRequestSchema);
