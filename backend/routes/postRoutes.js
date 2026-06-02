const express = require('express');
const router = express.Router();
const { getFeed, createPost, getMyPosts, getPost, updatePost, deletePost, toggleLike, addComment, getComments } = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', optionalAuth, getFeed);
router.post('/', protect, upload.single('image'), createPost);
router.get('/my-posts', protect, getMyPosts);
router.get('/:id', optionalAuth, getPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.get('/:id/comments', getComments);

module.exports = router;
