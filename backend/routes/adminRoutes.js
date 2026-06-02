// adminRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboard, getAllPosts, approvePost, rejectPost, adminDeletePost, getAllUsers, blockUser, unblockUser, deleteComment } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/posts', getAllPosts);
router.put('/posts/:id/approve', approvePost);
router.put('/posts/:id/reject', rejectPost);
router.delete('/posts/:id', adminDeletePost);
router.get('/users', getAllUsers);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/comments/:id', deleteComment);

module.exports = router;
