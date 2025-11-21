const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const router = express.Router();
const Profile = require('../models/User.js'); // Adjust the path to your Profile model
const authMiddleware = require('../middlewares/authMiddleware'); // Ensure you have a middleware to verify JWTs
const Preference = require('../models/Preference.js');


// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


router.post('/preference', authMiddleware, async (req, res) => {


  try {

    const { instituteId, phoneVisible } = req.body;

    const Pref = await Preference.updateOne({ instituteId: instituteId }, { $set: { phoneVisible: phoneVisible } }, { upsert: true })

    if (!Pref) {
      res.status(404).json({ message: "Not found" })
    }

    return res.status(200).json({
      success: true,
      data: Pref
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message })

  }

})

router.get('/preference', authMiddleware, async (req, res) => {
  try {
    const { instituteId } = req.query;

    const pref = await Preference.findOneAndUpdate({ instituteId }, {}, { upsert: true, new: true, setDefaultsOnInsert: true })

    return res.status(200).json({
      success: true,
      data: pref
    })

  } catch (err) {

    res.send(500).json({ message: "server error", error: err.message })

  }


})


// Get the currently logged-in user's profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ instituteId: req.user.instituteId }).select('-password');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit profile (including profile picture)
router.put('/me', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const { body, file } = req;

    // Find the user's profile
    const profile = await Profile.findOne({ instituteId: req.user.instituteId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Handle profile picture upload/update
    if (file) {
      // Delete the old profile picture from Cloudinary if it exists
      if (profile.profilePicturePublicId) {
        await cloudinary.uploader.destroy(profile.profilePicturePublicId);
      }

      // Upload the new profile picture to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'users/profile_pictures' },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      // Update the profile with the new picture URL and public ID
      body.profilePicture = uploadResponse.secure_url;
      body.profilePicturePublicId = uploadResponse.public_id;
    }

    // Update other profile fields
    const updatedProfile = await Profile.findOneAndUpdate(
      { instituteId: req.user.instituteId },
      { $set: body },
      { new: true }
    ).select('-password');

    res.json(updatedProfile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete profile picture
router.delete('/me/profilePicture', authMiddleware, async (req, res) => {
  try {
    // Find the user's profile
    const profile = await Profile.findOne({ instituteId: req.user.instituteId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete the profile picture from Cloudinary if it exists
    if (profile.profilePicturePublicId) {
      await cloudinary.uploader.destroy(profile.profilePicturePublicId);
      profile.profilePicture = null;
      profile.profilePicturePublicId = null;
      await profile.save();
    }

    res.json({ message: 'Profile picture deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user profile
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    // Find and delete the user's profile
    const profile = await Profile.findOneAndDelete({ instituteId: req.user.instituteId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete the profile picture from Cloudinary if it exists
    if (profile.profilePicturePublicId) {
      await cloudinary.uploader.destroy(profile.profilePicturePublicId);
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a specific profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).select('-password');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;