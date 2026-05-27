const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require("multer");

// Setting up Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// SignUp Route
router.post("/signup", upload.single("profilePicture"), authController.signUp);
router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);

module.exports = router;