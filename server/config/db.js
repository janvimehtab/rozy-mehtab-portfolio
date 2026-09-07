const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (!uri || uri.includes('localhost')) {
      console.log('🔍 Checking for local MongoDB or Atlas connection...');
    } else {
      console.log('☁️ Connecting to MongoDB Atlas...');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToMongo = true;
    console.log('✅ MongoDB Connected successfully.');
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`⚠️ MongoDB connection not established (${err.message}).`);
    console.log('⚡ Running in resilient in-memory mode for instant local testing.');
    console.log('👉 Tip: To connect your real MongoDB Atlas cluster, update MONGODB_URI in server/.env');
  }
};

const getIsConnected = () => isConnectedToMongo || mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
