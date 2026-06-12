require('dotenv').config();

/**
 * Centralized, validated environment configuration.
 * Import this instead of reading process.env directly across the app.
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // MongoDB — local string for now, swap to Atlas later via .env
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/track-down',

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change_me_access_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  },

  // File uploads (saved on the VPS disk)
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB, 10) || 5,
  },

  // Public base URL of this server (used to build absolute image URLs)
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',

  // CORS — comma separated list of allowed origins
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};

module.exports = env;
