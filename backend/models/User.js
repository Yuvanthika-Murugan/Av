const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  mobile: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 100]
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  profileImagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  bio: {
    type: DataTypes.STRING(300),
    allowNull: false,
    defaultValue: ''
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
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastSeen: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'users',
  defaultScope: {
    attributes: { exclude: ['password', 'profileImagePublicId'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password', 'profileImagePublicId'] }
    }
  },
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  values._id = values.id;
  delete values.password;
  delete values.profileImagePublicId;
  return values;
};

module.exports = User;
