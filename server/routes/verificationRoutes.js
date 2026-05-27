const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const VerificationCode = require('../models/VerificationCode');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailUtil');

// Request verification code
router.post('/request-code', async (req, res) => {
  try {
    const { instituteId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ instituteId });
    const isExistingUser = !!existingUser;

    // Generate a 6-digit verification code
    const code = crypto.randomInt(100000, 999999).toString();
    
    // Set expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    // Save or update verification code
    await VerificationCode.findOneAndUpdate(
      { instituteId },
      { 
        code,
        expiresAt,
        isVerified: false,
        isExistingUser
      },
      { upsert: true, new: true }
    );

    // Construct institute email address
    const instituteEmail = `${instituteId.split("@")[0]}@iiitkota.ac.in`;

    // Send verification email
    const emailSubject = isExistingUser 
      ? 'Verify Your IIIT Kota Alumni Account Update'
      : 'Verify Your IIIT Kota Alumni Account';
    
    const emailText = `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not request this verification, please ignore this email.</p>
      ${isExistingUser ? '<p>This verification is for updating your existing account.</p>' : ''}
    `;

    await sendVerificationEmail(instituteEmail, emailSubject, emailText);

    res.status(200).json({ 
      message: 'Verification code sent successfully',
      isExistingUser
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

// Verify code
router.post('/verify-code', async (req, res) => {
  try {
    const { instituteId, code } = req.body;

    const verification = await VerificationCode.findOne({
      instituteId,
      code,
      expiresAt: { $gt: Date.now() }
    });

    if (!verification) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification code' 
      });
    }

    // Mark as verified
    verification.isVerified = true;
    await verification.save();

    res.status(200).json({ 
      message: 'Email verified successfully',
      verified: true,
      isExistingUser: verification.isExistingUser
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Failed to verify code' });
  }
});

module.exports = router; 