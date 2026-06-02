const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [5, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [20, 2000]
    }
  },
  category: {
    type: DataTypes.ENUM('Web Development', 'Mobile', 'Design', 'AI/ML', 'DevOps', 'Marketing', 'Writing', 'Data Science', 'Other'),
    allowNull: false
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '',
    get() {
      const raw = this.getDataValue('skills');
      return raw ? raw.split(',').filter(Boolean) : [];
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('skills', value.map(v => v.trim()).filter(Boolean).join(','));
      } else if (typeof value === 'string') {
        this.setDataValue('skills', value.split(',').map(v => v.trim()).filter(Boolean).join(','));
      } else {
        this.setDataValue('skills', '');
      }
    }
  },
  budget: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  imagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  rejectionReason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'posts',
  indexes: [
    { fields: ['userId'] },
    { fields: ['approvalStatus'] },
    { fields: ['category'] }
  ]
});

Post.prototype.toJSON = function() {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = Post;
