const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instituteId: { type: String, required: true },
  branch: { type: String, required: true },
  personalEmail: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  graduationYear: { type: String, required: true },
  pastCompanies: { type: String },
  currentCompany: { type: String, required: true },
  role: { type: String, enum: ['alumni'], default: 'alumni' },
  weeklyReferralLimit: { type: Number, default: 5 },
  referralsReceivedThisWeek: { type: Number, default: 0 },
  weeklyLimitResetAt: { type: Date },
  referralQueueIndex: { type: Number, default: 0 },
  referralsGivenByMonth: [{ month: String, count: Number }],
  linkedin: { type: String },
  achievements: { type: String },
  password: { type: String, required: true },
  profilePicture: { type: String },
  profilePicturePublicId: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model('User', UserSchema);