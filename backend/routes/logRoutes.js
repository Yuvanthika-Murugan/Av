const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { LoginLog, User } = require('../models');
const { normalize } = require('../utils/dbUtils');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (userId) where.userId = userId;
    if (status) where.sessionStatus = status;

    const [logs, total] = await Promise.all([
      LoginLog.findAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        order: [['loginTime', 'DESC']],
        offset: skip,
        limit: parseInt(limit)
      }),
      LoginLog.count({ where })
    ]);

    res.json({
      success: true,
      logs: normalize(logs),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch logs.' });
  }
});

router.get('/my-sessions', protect, async (req, res) => {
  try {
    const logs = await LoginLog.findAll({
      where: { userId: req.user.id },
      order: [['loginTime', 'DESC']],
      limit: 10
    });
    res.json({ success: true, logs: normalize(logs) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions.' });
  }
});

module.exports = router;
