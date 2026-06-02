const { User } = require('../models');

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@freelancehub.com';
    const existing = await User.findOne({ where: { email } });
    if (!existing) {
      await User.create({
        name: 'Admin',
        email,
        mobile: '+1 000 000 0000',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin'
      });
      console.log('✅ Admin user seeded:', email);
    }
  } catch (err) {
    console.error('Seed admin error:', err.message);
  }
};

module.exports = { seedAdmin };
