const { Op, Sequelize } = require('sequelize');
const { Post, User, Like, Comment } = require('../models');
const { normalize } = require('../utils/dbUtils');

const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { approvalStatus: 'approved', isDeleted: false };
    if (category && category !== 'All') where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        Sequelize.where(Sequelize.cast(Sequelize.col('skills'), 'char'), { [Op.like]: `%${search}%` })
      ];
    }

    const [posts, total] = await Promise.all([
      Post.findAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage', 'isOnline'] }],
        order: [['createdAt', 'DESC']],
        offset: skip,
        limit: parseInt(limit)
      }),
      Post.count({ where })
    ]);

    let likedPostIds = new Set();
    if (req.user) {
      const likes = await Like.findAll({
        where: { userId: req.user.id, postId: posts.map(p => p.id) }
      });
      likedPostIds = new Set(likes.map(l => l.postId));
    }

    const postsWithLikes = posts.map((p) => {
      const normalized = normalize(p);
      return { ...normalized, isLiked: likedPostIds.has(normalized._id) };
    });

    res.json({
      success: true,
      posts: postsWithLikes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNextPage: skip + posts.length < total
      }
    });
  } catch (err) {
    console.error('Get feed error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts.' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, description, category, skills, budget } = req.body;
    const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);

    const post = await Post.create({
      userId: req.user.id,
      title,
      description,
      category,
      budget,
      skills: skillsArray,
      image: req.file ? req.file.path : null,
      imagePublicId: req.file ? req.file.filename : null
    });

    await post.reload({ include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] }] });
    res.status(201).json({ success: true, message: 'Post submitted for approval.', post: normalize(post) });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error('Create post error:', err);
    res.status(500).json({ success: false, message: 'Failed to create post.' });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { userId: req.user.id, isDeleted: false };
    if (status) where.approvalStatus = status;

    const [posts, total] = await Promise.all([
      Post.findAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit: parseInt(limit) }),
      Post.count({ where })
    ]);

    res.json({
      success: true,
      posts: normalize(posts),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total
      }
    });
  } catch (err) {
    console.error('Get my posts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch your posts.' });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage', 'bio', 'skills', 'isOnline'] }]
    });
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comments = await Comment.findAll({
      where: { postId: post.id, isDeleted: false },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({ where: { userId: req.user.id, postId: post.id } });
      isLiked = !!like;
    }

    res.json({ success: true, post: { ...normalize(post), isLiked }, comments: normalize(comments) });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch post.' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, category, skills, budget } = req.body;
    const updates = { title, description, category, budget, approvalStatus: 'pending' };
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (req.file) {
      updates.image = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    await post.update(updates);
    await post.reload();
    res.json({ success: true, message: 'Post updated and re-submitted for approval.', post: normalize(post) });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ success: false, message: 'Failed to update post.' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Post not found.' });

    const isOwner = post.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized.' });

    await post.update({ isDeleted: true });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post || post.approvalStatus !== 'approved') {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const existing = await Like.findOne({ where: { userId: req.user.id, postId: post.id } });
    let liked;

    if (existing) {
      await existing.destroy();
      await post.decrement('likesCount');
      liked = false;
    } else {
      await Like.create({ userId: req.user.id, postId: post.id });
      await post.increment('likesCount');
      liked = true;
    }

    await post.reload();
    res.json({ success: true, liked, likesCount: post.likesCount });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle like.' });
  }
};

const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    }

    const post = await Post.findByPk(req.params.id);
    if (!post || post.approvalStatus !== 'approved') {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const newComment = await Comment.create({ userId: req.user.id, postId: post.id, comment: comment.trim() });
    await post.increment('commentsCount');
    await newComment.reload({ include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] }] });

    res.status(201).json({ success: true, comment: normalize(newComment) });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { postId: req.params.id, isDeleted: false },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ success: true, comments: normalize(comments) });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
  }
};

module.exports = { getFeed, createPost, getMyPosts, getPost, updatePost, deletePost, toggleLike, addComment, getComments };
