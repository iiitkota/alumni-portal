const express = require('express');
const router = express.Router();
const { registerStudent, verifyOtp, loginStudent, getStudentProfile } = require('../controllers/studentAuthController');
const { authenticateStudent } = require('../middleware/roleMiddleware');

router.post('/register', registerStudent);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginStudent);
router.get('/me', authenticateStudent, getStudentProfile);

module.exports = router;
