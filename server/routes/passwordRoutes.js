const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt"); // Add bcrypt
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail.js");
const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  let { instituteId } = req.body;

  // If instituteId contains "@iiitkota.ac.in", extract the actual instituteId
  if (instituteId.includes("@iiitkota.ac.in")) {
    instituteId = instituteId.split("@")[0]; // Extract only the ID part
  }

  try {
    const user = await User.findOne({ instituteId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `https://alumni.iiitkota.ac.in/reset-password/${token}`;
    const instituteEmail = `${user.instituteId}@iiitkota.ac.in`; // Construct email from instituteId

    const message = `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(instituteEmail, "Password Reset Request", message);

    res.status(200).json({ message: "Password reset email sent to your institute email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;