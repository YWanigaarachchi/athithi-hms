const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'athithi_hms',
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    // Seed comprehensive sample data if database is fresh
    const { seedDatabase } = require('./seedData');
    await seedDatabase();
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
