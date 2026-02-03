/* eslint-env node */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'kaduna_court_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection (non-blocking - allows server to start even if DB is not ready)
pool.getConnection()
  .then(connection => {
    console.log('[DATABASE] Database connected successfully');
    connection.release();
  })
  .catch(error => {
    console.error('[ERROR] Database connection failed:', error.message);
    console.error('   Please check your .env file and ensure MySQL is running');
    console.error('   The server will continue but API calls requiring database will fail');
    // Don't exit - allow server to start for development
    // process.exit(1);
  });

export default pool;