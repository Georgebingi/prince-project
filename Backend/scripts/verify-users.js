/**
 * Script to verify users in the database
 * Run with: node scripts/verify-users.js
 */
/* eslint-env node */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

async function verifyUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'kaduna_court_db'
  });

  try {
    console.log('[VERIFY] Verifying users in database...\n');

    // Get all users
    const [users] = await connection.query(
      'SELECT id, name, email, staff_id, role, status, password_hash FROM users'
    );

    if (users.length === 0) {
      console.log('[ERROR] No users found in database!');
      console.log('   Run: node scripts/create-admin.js to create users');
      return;
    }

    console.log(`[SUCCESS] Found ${users.length} user(s) in database:\n`);

    for (const user of users) {
      console.log(`[USER] User: ${user.name}`);
      console.log(`   [EMAIL] Email: ${user.email}`);
      console.log(`   [STAFF_ID] Staff ID: ${user.staff_id || 'N/A'}`);
      console.log(`   [ROLE] Role: ${user.role}`);
      console.log(`   [STATUS] Status: ${user.status}`);
      console.log(`   [PASSWORD_HASH] Password Hash: ${user.password_hash ? '[PRESENT] Present' : '[MISSING] MISSING'}`);
      
      if (user.password_hash) {
        console.log(`   [HASH_LENGTH] Hash Length: ${user.password_hash.length} characters`);
        console.log(`   [HASH_PREVIEW] Hash Preview: ${user.password_hash.substring(0, 20)}...`);
      }
      console.log('');
    }

    // Test password verification for admin user
    const adminUser = users.find(u => u.role === 'admin' && u.status === 'active');
    if (adminUser && adminUser.password_hash) {
      console.log('[TEST] Testing password verification for admin user...');
      const testPasswords = ['Admin123!', 'admin123', 'Admin123'];
      
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, adminUser.password_hash);
        console.log(`   [TEST] Testing "${testPassword}": ${isValid ? '[MATCH] MATCH' : '[NO_MATCH] No match'}`);
      }
    }

    console.log('\n[SUCCESS] Verification complete!');
  } catch (error) {
    console.error('[ERROR] Error verifying users:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Check your database credentials in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   Database does not exist. Run schema.sql first!');
    }
  } finally {
    await connection.end();
  }
}

verifyUsers();
