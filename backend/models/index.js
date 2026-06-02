const { sequelize } = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const { LoginLog, Like, Comment, BlockedUser } = require('./Activity');

User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.belongsTo(User, { foreignKey: 'approvedBy', as: 'approvedByUser' });

User.hasMany(LoginLog, { foreignKey: 'userId', as: 'loginLogs' });
LoginLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasOne(BlockedUser, { foreignKey: 'userId', as: 'blockedRecord' });
BlockedUser.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BlockedUser.belongsTo(User, { foreignKey: 'blockedBy', as: 'blockedByUser' });

module.exports = { sequelize, User, Post, LoginLog, Like, Comment, BlockedUser };