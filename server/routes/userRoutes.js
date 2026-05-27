const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/directory', authMiddleware, userController.getUserDirectory);

module.exports = router;