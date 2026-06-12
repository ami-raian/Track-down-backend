const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connect to MongoDB using Mongoose.
 * Works with both a local connection string and MongoDB Atlas —
 * only the MONGO_URI value in .env needs to change.
 */
async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
}

module.exports = connectDB;
