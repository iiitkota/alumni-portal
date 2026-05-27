const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { sendEmail } = require('../utils/emailUtil'); // Import the email utility

// Setting up Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("profilePicture"), async (req, res) => {
  try {
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

    // Initialising the profilePictureUrl variable
    let profilePictureUrl = null;

    // Upload profile picture to Cloudinary if provided
    if (req.file) {
      profilePictureUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "profile_pictures" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
    }

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
      password,
      profilePicture: profilePictureUrl,
    });

    await user.save();

    // Send email with login details
    await sendEmail(personalEmail, name, instituteId, password);

    res.status(201).json({ message: "User registered successfully and email sent" });

  } catch (error) {
    console.error(error.message);

    if (error.code === 11000 && error.keyValue && error.keyValue.instituteId) {
      res.status(400).json({ message: "A user has already registered using this institute ID. If you think this is an error, contact alumni cell at alumnicell@iiitkota.ac.in ." });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

module.exports = router;