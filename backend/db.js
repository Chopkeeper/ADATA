const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if running in a container or local
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/advice_ecommerce';
    
    await mongoose.connect(MONGO_URI);

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;