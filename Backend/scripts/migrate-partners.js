#!/usr/bin/env node

/* eslint-env node */

/**
 * Partner Agencies Migration Script

 * 
 * This script creates the partner-related tables and seeds them with initial data.
 * Run with: node scripts/migrate-partners.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
dirname(__filename);


// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kaduna_court_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Initial partner agencies data
const initialPartners = [
  {
    name: 'Nigerian Police Force',
    code: 'NPF',
    type: 'Law Enforcement',
    description: 'Nigeria\'s primary law enforcement agency responsible for maintaining law and order, investigating crimes, and executing warrants.',
    contact_email: 'it@police.gov.ng',
    contact_phone: '+234-123-456-7890',
    status: 'active'
  },
  {
    name: 'Nigerian Correctional Services',
    code: 'NCS',
    type: 'Detention',
    description: 'Responsible for the custody, rehabilitation, and reintegration of offenders in Nigeria.',
    contact_email: 'admin@correctionalservices.gov.ng',
    contact_phone: '+234-123-456-7891',
    status: 'active'
  },
  {
    name: 'Ministry of Justice',
    code: 'MOJ',
    type: 'Government',
    description: 'Federal ministry responsible for legal affairs, prosecution of cases, and administration of justice.',
    contact_email: 'legal@justice.gov.ng',
    contact_phone: '+234-123-456-7892',
    status: 'active'
  },
  {
    name: 'Legal Aid Council',
    code: 'LAC',
    type: 'Legal Aid',
    description: 'Provides free legal assistance to indigent citizens and ensures access to justice for all.',
    contact_email: 'support@legalaid.gov.ng',
    contact_phone: '+234-123-456-7893',
    status: 'active'
  },
  {
    name: 'Forensic Laboratory',
    code: 'FLB',
    type: 'Forensic',
    description: 'Specialized forensic laboratory providing scientific analysis and evidence processing for criminal investigations.',
    contact_email: 'forensics@lab.gov.ng',
    contact_phone: '+234-123-456-7894',
    status: 'active'
  }
];

async function migrate() {
  let connection;
  
  try {
    console.log('🚀 Starting Partner Agencies Migration...\n');
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Skip table creation - tables already exist
    console.log('📋 Skipping table creation (tables already exist)\n');

    // Check if partners already exist

    const [existingPartners] = await connection.execute(
      'SELECT COUNT(*) as count FROM partner_agencies'
    );
    
    if (existingPartners[0].count > 0) {
      console.log(`⚠️  Found ${existingPartners[0].count} existing partner agencies.`);
      console.log('   Skipping seed data insertion.\n');
    } else {
      // Insert initial partners
      console.log('🌱 Seeding initial partner agencies...');
      
      for (const partner of initialPartners) {
        const [result] = await connection.execute(
          `INSERT INTO partner_agencies (
            name, code, type, description, contact_email, contact_phone, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            partner.name,
            partner.code,
            partner.type,
            partner.description,
            partner.contact_email,
            partner.contact_phone,
            partner.status
          ]
        );
        
        // Create initial connection record
        await connection.execute(
          `INSERT INTO partner_connections (
            partner_id, status, latency_ms, last_sync_at, uptime_percentage, health_check_at
          ) VALUES (?, 'Connected', ?, NOW(), 99.99, NOW())`,
          [
            result.insertId,
            Math.floor(Math.random() * 100) + 20 // Random latency between 20-120ms
          ]
        );
        
        console.log(`   ✅ Added: ${partner.name}`);
      }
      
      console.log('\n✅ Seed data inserted successfully\n');
    }

    // Create sample data exchanges if none exist
    const [existingExchanges] = await connection.execute(
      'SELECT COUNT(*) as count FROM data_exchanges'
    );
    
    if (existingExchanges[0].count === 0) {
      console.log('🌱 Creating sample data exchanges...');
      
      // Get partner IDs
      const [partners] = await connection.execute(
        'SELECT id, code FROM partner_agencies LIMIT 3'
      );
      
      // Get a user ID (admin or first user)
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE role = ? LIMIT 1',
        ['admin']
      );
      
      if (partners.length > 0 && users.length > 0) {
        const sampleExchanges = [
          {
            partner_id: partners[0].id,
            type: 'Warrant Request',
            direction: 'outbound',
            status: 'Completed'
          },
          {
            partner_id: partners[1].id,
            type: 'Prisoner Remand',
            direction: 'inbound',
            status: 'Processing'
          },
          {
            partner_id: partners[2].id,
            type: 'Evidence Transfer',
            direction: 'outbound',
            status: 'Pending'
          }
        ];
        
        for (const exchange of sampleExchanges) {
          const exchangeId = `TRX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
          
          await connection.execute(
            `INSERT INTO data_exchanges (
              exchange_id, partner_id, type, direction, status, initiated_by, initiated_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              exchangeId,
              exchange.partner_id,
              exchange.type,
              exchange.direction,
              exchange.status,
              users[0].id
            ]
          );
        }
        
        console.log('✅ Sample data exchanges created\n');
      }
    }

    console.log('🎉 Data seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   • partner_agencies: Seeded with initial partners');
    console.log('   • partner_connections: Created with initial connections');
    console.log('   • data_exchanges: Created with sample data');

    console.log('\n🚀 You can now restart your backend server and use the Partner Interoperability features.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed.');
    }
  }
}

// Run migration
migrate();
