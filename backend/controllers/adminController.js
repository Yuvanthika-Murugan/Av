const { Op, Sequelize } = require('sequelize');
const { User, Post, LoginLog, BlockedUser, Comment } = require('../models');
const { normalize } = require('../utils/dbUtils');

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      pendingPosts,
      blockedUsers,
      activeSessions,
      recentPosts,
      recentUsers
    ] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      Post.count({ where: { isDeleted: false } }),
      Post.count({ where: { approvalStatus: 'pending', isDeleted: false } }),
      User.count({ where: { isBlocked: true } }),
      LoginLog.count({ where: { sessionStatus: 'active' } }),
      Post.findAll({ where: { isDeleted: false }, include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profileImage'] }], order: [['createdAt', 'DESC']], limit: 5 }),
      User.findAll({ where: { role: 'user' }, order: [['createdAt', 'DESC']], limit: 5 })
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStatsRaw = await LoginLog.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('loginTime')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'logins']
      ],
      where: { loginTime: { [Op.gte]: sevenDaysAgo } },
      group: ['date'],
      order: [[Sequelize.literal('date'), 'ASC']]
    });

    const dailyStats = dailyStatsRaw.map((row) => ({ _id: row.get('date'), logins: parseInt(row.get('logins'), 10) }));

    res.json({
      success: true,
      stats: { totalUsers, totalPosts, pendingPosts, blockedUsers, activeSessions },
      recentPosts: normalize(recentPosts),
      recentUsers: normalize(recentUsers),
      dailyStats
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, search, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { isDeleted: false };
    if (status) where.approvalStatus = status;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const [posts, total] = await Promise.all([
      Post.findAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profileImage'] }],
        order: [['createdAt', 'DESC']],
        offset: skip,
        limit: parseInt(limit)
      }),
      Post.count({ where })
    ]);

    res.json({ success: true, posts: normalize(posts), pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalPosts: total } });
  } catch (err) {
    console.error('Get all posts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts.' });
  }
};

const approvePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    await post.update({ approvalStatus: 'approved', approvedBy: req.user.id, approvedAt: new Date(), rejectionReason: null });
    await post.reload({ include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }] });
    res.json({ success: true, message: 'Post approved and published.', post: normalize(post) });
  } catch (err) {
    console.error('Approve post error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve post.' });
  }
};

const rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    await post.update({ approvalStatus: 'rejected', rejectionReason: reason || 'Does not meet platform standards', approvedBy: req.user.id, approvedAt: new Date() });
    await post.reload({ include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }] });
    res.json({ success: true, message: 'Post rejected.', post: normalize(post) });
  } catch (err) {
    console.error('Reject post error:', err);
    res.status(500).json({ success: false, message: 'Failed to reject post.' });
  }
};

const adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    await post.update({ isDeleted: true });
    res.json({ success: true, message: 'Post permanently removed.' });
  } catch (err) {
    console.error('Admin delete post error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { role: 'user' };
    if (status === 'blocked') where.isBlocked = true;
    if (status === 'active') where.isBlocked = false;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const [users, total] = await Promise.all([
      User.findAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit: parseInt(limit) }),
      User.count({ where })
    ]);

    const enriched = await Promise.all(users.map(async (u) => {
      const postCount = await Post.count({ where: { userId: u.id, isDeleted: false } });
      const lastLogin = await LoginLog.findOne({ where: { userId: u.id }, order: [['loginTime', 'DESC']] });
      return { ...normalize(u), postCount, lastLogin: lastLogin?.loginTime };
    }));

    res.json({ success: true, users: enriched, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalUsers: total } });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.update({ isBlocked: true });

    await BlockedUser.upsert({
      userId: user.id,
      blockedBy: req.user.id,
      blockedReason: reason || 'Policy violation',
      blockedAt: new Date()
    });

    await LoginLog.update({ logoutTime: new Date(), sessionStatus: 'expired' }, { where: { userId: user.id, sessionStatus: 'active' } });

    res.json({ success: true, message: `User ${user.name} has been blocked.`, user: normalize(user) });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ success: false, message: 'Failed to block user.' });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.update({ isBlocked: false });
    await BlockedUser.destroy({ where: { userId: user.id } });
    res.json({ success: true, message: `User ${user.name} has been unblocked.`, user: normalize(user) });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({ success: false, message: 'Failed to unblock user.' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    await comment.update({ isDeleted: true });
    await Post.decrement('commentsCount', { where: { id: comment.postId } });
    res.json({ success: true, message: 'Comment removed.' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete comment.' });
  }
};

module.exports = { getDashboard, getAllPosts, approvePost, rejectPost, adminDeletePost, getAllUsers, blockUser, unblockUser, deleteComment };
