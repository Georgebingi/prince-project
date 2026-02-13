#!/usr/bin/env node
/* eslint-env node */
/**
 * Migration script to add motions and orders tables
 * Run with: node scripts/migrate-motions-orders.js
 */


import db from '../src/config/database.js';

async function migrate() {
  console.log('[MIGRATION] Starting motions and orders tables migration...');
  
  try {
    // Create motions table
    console.log('[MIGRATION] Creating motions table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS motions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        case_id INT NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        filed_by INT NOT NULL,
        filed_date DATE NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        document_url VARCHAR(1000),
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (filed_by) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_case_id (case_id),
        INDEX idx_filed_by (filed_by),
        INDEX idx_status (status),
        INDEX idx_filed_date (filed_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('[MIGRATION] ✓ Motions table created successfully');

    // Create orders table
    console.log('[MIGRATION] Creating orders table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        case_id INT NOT NULL,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        drafted_by INT NOT NULL,
        drafted_date DATE NOT NULL,
        status ENUM('Draft', 'Signed') DEFAULT 'Draft',
        signed_by INT,
        signed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (drafted_by) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (signed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_case_id (case_id),
        INDEX idx_drafted_by (drafted_by),
        INDEX idx_status (status),
        INDEX idx_drafted_date (drafted_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('[MIGRATION] ✓ Orders table created successfully');

    // Insert sample data for testing (optional)
    console.log('[MIGRATION] Checking for existing cases to create sample motions/orders...');
    const [cases] = await db.query('SELECT id, judge_id FROM cases LIMIT 5');
    
    if (cases.length > 0) {
      console.log(`[MIGRATION] Found ${cases.length} cases, creating sample data...`);
      
      for (const caseItem of cases) {
        // Create sample motion
        await db.query(`
          INSERT INTO motions (case_id, title, description, filed_by, filed_date, status)
          VALUES (?, 'Motion for Extension of Time', 'Requesting additional time to file response', ?, CURDATE(), 'Pending')
          ON DUPLICATE KEY UPDATE id=id
        `, [caseItem.id, caseItem.judge_id || 1]);
        
        // Create sample order
        await db.query(`
          INSERT INTO orders (case_id, title, content, drafted_by, drafted_date, status)
          VALUES (?, 'Order to Show Cause', 'Defendant is ordered to show cause why...', ?, CURDATE(), 'Draft')
          ON DUPLICATE KEY UPDATE id=id
        `, [caseItem.id, caseItem.judge_id || 1]);
      }
      console.log('[MIGRATION] ✓ Sample data created successfully');
    }

    console.log('[MIGRATION] ✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[MIGRATION] ✗ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
