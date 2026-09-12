const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    isConnectedToMongo = false;
    console.warn('⚠️ MONGODB_URI not configured.');
    console.log('⚡ Running in resilient in-memory mode for instant local testing.');
    return;
  }

  try {
    const isAtlas = uri.startsWith('mongodb+srv://') || !uri.includes('localhost');
    if (isAtlas) {
      console.log('☁️ Connecting to MongoDB Atlas cluster...');
    } else {
      console.log('🔍 Connecting to local MongoDB instance...');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s timeout to allow for Render cloud cold starts & DNS resolution
    });

    isConnectedToMongo = true;
    console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host} [DB: "${conn.connection.name}"]`);
  } catch (err) {
    isConnectedToMongo = false;
    console.error(`❌ MongoDB Atlas connection failed: ${err.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('👉 Tip: Ensure IP 0.0.0.0/0 (Anywhere) is whitelisted in MongoDB Atlas Network Access.');
    } else {
      console.log('⚡ Running in resilient in-memory mode for instant local testing.');
    }
  }
};

const getIsConnected = () => isConnectedToMongo || mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
