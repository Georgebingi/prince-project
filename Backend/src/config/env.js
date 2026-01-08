/* eslint-env node */
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'kaduna_court_db'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    path: process.env.UPLOAD_PATH || './uploads'
  }
};
