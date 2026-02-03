/**
 * Script to create default users for all core roles
 * Run with: node scripts/create-admin.js
 *
 * This script is SAFE to run multiple times – it will skip users that already exist
 * (matched by email or staff_id).
 */
/* eslint-env node */
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createDefaultUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'kaduna_court_db'
  });

  try {
    // Default users for each role
    // NOTE: Change these passwords in production!
    const defaultUsers = [
      {
        name: 'System Administrator',
        email: 'admin@kadunacourt.gov.ng',
        password: 'Admin123!',
        staffId: 'ADM/2026/001',
        role: 'admin',
        department: 'IT Systems'
      },
      {
        name: 'Chief Judge',
        email: 'judge@kadunacourt.gov.ng',
        password: 'Judge123!',
        staffId: 'JDG/2026/001',
        role: 'judge',
        department: 'Judiciary'
      },
      {
        name: 'Court Registrar',
        email: 'registrar@kadunacourt.gov.ng',
        password: 'Registrar123!',
        staffId: 'REG/2026/001',
        role: 'registrar',
        department: 'Registry'
      },
      {
        name: 'Court Clerk',
        email: 'clerk@kadunacourt.gov.ng',
        password: 'Clerk123!',
        staffId: 'CLK/2026/001',
        role: 'clerk',
        department: 'Court Clerks'
      },
      {
        name: 'IT Administrator',
        email: 'itadmin@kadunacourt.gov.ng',
        password: 'Itadmin123!',
        staffId: 'ITA/2026/001',
        role: 'it_admin',
        department: 'IT Systems'
      },
      {
        name: 'Court Administrator',
        email: 'courtadmin@kadunacourt.gov.ng',
        password: 'Courtadmin123!',
        staffId: 'CADM/2026/001',
        role: 'court_admin',
        department: 'Administration'
      },
      {
        name: 'Default Lawyer',
        email: 'lawyer@kadunacourt.gov.ng',
        password: 'Lawyer123!',
        staffId: 'LAW/2026/001',
        role: 'lawyer',
        department: 'Bar'
      },
      {
        name: 'Audit Officer',
        email: 'auditor@kadunacourt.gov.ng',
        password: 'Auditor123!',
        staffId: 'AUD/2026/001',
        role: 'auditor',
        department: 'Audit'
      },
      {
        name: 'Partner Liaison',
        email: 'partner@kadunacourt.gov.ng',
        password: 'Partner123!',
        staffId: 'PTN/2026/001',
        role: 'partner',
        department: 'Partners'
      }
    ];

    console.log('[SETUP] Creating default users (if missing)...\n');

    for (const user of defaultUsers) {
      // Check if user already exists
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE email = ? OR staff_id = ?',
        [user.email, user.staffId]
      );

      if (existing.length > 0) {
        console.log(`[WARN] ${user.role.toUpperCase()} user already exists (email: ${user.email}). Skipping.`);
        continue;
      }

      const passwordHash = await bcrypt.hash(user.password, 10);

      // Verify the hash was created correctly
      const verifyHash = await bcrypt.compare(user.password, passwordHash);
      if (!verifyHash) {
        console.error(`[ERROR] Password hash verification failed for ${user.email}. Skipping user creation.`);
        continue;
      }

      await connection.query(
        `INSERT INTO users (name, email, password_hash, staff_id, role, department, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [user.name, user.email, passwordHash, user.staffId, user.role, user.department]
      );

      // Verify the user was created and password_hash is stored correctly
      const [verify] = await connection.query(
        'SELECT id, email, password_hash FROM users WHERE email = ?',
        [user.email]
      );

      if (verify.length === 0 || !verify[0].password_hash) {
        console.error(`[ERROR] User created but password_hash verification failed for ${user.email}`);
        continue;
      }

      // Test password verification one more time with stored hash
      const storedHashVerify = await bcrypt.compare(user.password, verify[0].password_hash);
      if (!storedHashVerify) {
        console.error(`[ERROR] Stored password hash verification failed for ${user.email}`);
        continue;
      }

      console.log(`[SUCCESS] ${user.role.toUpperCase()} user created successfully!`);
      console.log('   [EMAIL] Email:', user.email);
      console.log('   [PASSWORD] Password:', user.password);
      console.log('   [STAFF_ID] Staff ID:', user.staffId);
      console.log('   [VERIFIED] Password hash verified and stored correctly');
      console.log('');
    }

    console.log('[SUCCESS] Done creating default users.');
    console.log('[WARN] For security, change these default passwords after first login.');
  } catch (error) {
    console.error('[ERROR] Error creating admin user:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Check your database credentials in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   Database does not exist. Run schema.sql first!');
    }
  } finally {
    await connection.end();
  }
}

createDefaultUsers();
