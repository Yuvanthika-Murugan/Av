const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoginLog = sequelize.define('LoginLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  loginTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  logoutTime: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  sessionStatus: {
    type: DataTypes.ENUM('active', 'expired', 'manual_logout'),
    defaultValue: 'active'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Unknown'
  },
  deviceInfo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Unknown'
  },
  tokenId: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'login_logs',
  indexes: [
    { fields: ['userId'] },
    { fields: ['tokenId'] }
  ]
});

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'likes',
  indexes: [
    { unique: true, fields: ['userId', 'postId'] }
  ]
});

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'comments',
  indexes: [
    { fields: ['postId'] }
  ]
});

const BlockedUser = sequelize.define('BlockedUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  blockedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  blockedReason: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Violation of platform terms'
  },
  blockedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'blocked_users'
});

[LoginLog, Like, Comment, BlockedUser].forEach((model) => {
  model.prototype.toJSON = function() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };
});

module.exports = { LoginLog, Like, Comment, BlockedUser };
