const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateStudent, authenticateAlumni, authenticateAny } = require('../middleware/roleMiddleware');
const {
  sendReferralRequest,
  getMyRequests,
  withdrawRequest,
  getAlumniInbox,
  respondToRequest,
  setWeeklyLimit,
  getMessages,
  sendMessage,
  getUnreadCount
} = require('../controllers/referralController');

// Multer memory storage configuration for raw resume file uploading
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Student Referral Routes
router.post('/request', authenticateStudent, upload.single('resume'), sendReferralRequest);
router.get('/my-requests', authenticateStudent, getMyRequests);
router.delete('/request/:id/withdraw', authenticateStudent, withdrawRequest);

// Alumni Referral Routes
router.get('/inbox', authenticateAlumni, getAlumniInbox);
router.patch('/request/:id/respond', authenticateAlumni, respondToRequest);
router.patch('/limit', authenticateAlumni, setWeeklyLimit);

// Messaging Routes (Shared)
router.get('/request/:id/messages', authenticateAny, getMessages);
router.post('/request/:id/messages', authenticateAny, sendMessage);

// Unread Count Route
router.get('/unread-count', authenticateAny, getUnreadCount);

module.exports = router;
