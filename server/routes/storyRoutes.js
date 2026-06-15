const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// GET /api/stories - Fetch all stories for the carousel, sorted by order
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find().sort({ order: 1 });
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
