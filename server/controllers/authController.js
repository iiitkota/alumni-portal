const bcrypt = require('bcrypt');
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const cloudinary = require("../config/cloudinary.js");
const streamifier = require("streamifier");
const { sendEmail } = require('../utils/emailUtil');
const VerificationCode = require('../models/VerificationCode');

exports.signUp = async (req, res) => {
  const {
    name,
    instituteId,
    branch,
    personalEmail,
    phoneNumber,
    city,
    state,
    country,
    graduationYear,
    pastCompanies,
    currentCompany,
    role,
    linkedin,
    achievements,
    password
  } = req.body;

  try {
    console.log('Checking verification for instituteId:', instituteId);
    
    // Check if email is verified
    const verification = await VerificationCode.findOne({ 
      instituteId,
      isVerified: true
    });

    console.log('Verification result:', verification);

    if (!verification) {
      return res.status(400).json({ 
        message: "Please verify your email before registration",
        details: "No verified verification code found for this institute ID"
      });
    }

    // Check if a user with the same email exists
    const existingUserByEmail = await User.findOne({ personalEmail });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    // Check if a user with the same instituteId exists
    const existingUserByInstituteId = await User.findOne({ instituteId });
    if (existingUserByInstituteId) {
      return res.status(400).json({ message: "A user with this institute ID already exists. If you think this is an error, contact the alumni cell at alumnicell@iiitkota.ac.in." });
    }

    // Initialize profile picture variables
    let profilePictureUrl = null;
    let profilePicturePublicId = null;

    // Upload profile picture to Cloudinary if provided
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "profile_pictures" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      profilePictureUrl = uploadResult.secure_url;
      profilePicturePublicId = uploadResult.public_id;
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user data to the database
    const user = new User({
      name,
      instituteId,
      branch,
      personalEmail,
      phoneNumber,
      city,
      state,
      country,
      graduationYear,
      pastCompanies,
      currentCompany,
      role,
      linkedin,
      achievements,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
      profilePicturePublicId,
    });

    await user.save();

    // Delete the verification code after successful registration
    await VerificationCode.findOneAndDelete({ instituteId });

    // Send welcome email to institute email
    try {
      const instituteEmail = `${instituteId}@iiitkota.ac.in`;
      await sendEmail(instituteEmail, name, instituteId, password);
      console.log('Welcome email sent successfully to:', instituteEmail);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({ message: "User registered successfully and email sent to institute email" });

  } catch (error) {
    console.error(error.message);

    if (error.code === 11000 && error.keyValue && error.keyValue.instituteId) {
      res.status(400).json({ message: "A user has already registered using this institute ID. If you think this is an error, contact the alumni cell at alumnicell@iiitkota.ac.in." });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

exports.signIn = async (req, res) => {
  const { instituteId, password } = req.body;

  try {
    const user = await User.findOne({ instituteId });

    if (!user) { 
      return res.status(400).json({ message: 'Invalid institute ID or password' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid institute ID or password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, instituteId: user.instituteId },
      JWT_SECRET,
      { expiresIn: '30d' } // Token expiration time
    );

    res.json({ token });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' });
  }
};

exports.signOut = (req, res) => {
  // Remove token logic
  localStorage.removeItem("token");
};