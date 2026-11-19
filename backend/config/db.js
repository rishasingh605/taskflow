// config/db.js
// This file connects our Express app to MongoDB using Mongoose.

const mongoose = require('mongoose');

// connectDB is an async function — it tries to connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Notice: ${error.message}`);
    console.log('ℹ️ Server will continue running.');
  }
};

module.exports = connectDB;
