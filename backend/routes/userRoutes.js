const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { User } = require('../models');
const { normalize } = require('../utils/dbUtils');

router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: normalize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
});

module.exports = router;
