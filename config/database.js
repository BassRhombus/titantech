const mongoose = require('mongoose');

// MongoDB connection string with authentication
const DB_URI = 'mongodb://user-admin:hmr7knd0xhp0TKC_ugy@104.243.37.159:25060/titantech';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
