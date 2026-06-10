const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'athithi_hms',
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    // Seed default staff user if none exists
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding default staff user...');
      await User.create({
        name: 'Athithi Staff',
        email: 'staff@hotel.lk',
        password: 'password123',
        role: 'admin',
      });
      console.log('✅ Default staff user seeded: email="staff@hotel.lk", password="password123"');
    }
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
