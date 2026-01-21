// This file is intended for the Node.js Backend Server
const mongoose = require('mongoose');

// Credentials requested
const DB_USER = 'admin';
const DB_PASS = 'Chopkeeper';
const DB_HOST = 'localhost';
const DB_PORT = '27017';
const DB_NAME = 'advice_ecommerce';

// Connection String Construction
// Note: ?authSource=admin is usually required when using root/admin credentials
const MONGO_URI = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected Successfully');
    console.log(`Connected as user: ${DB_USER}`);
    
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;