const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Try PostgreSQL first, fallback to SQLite
let db;
let dbType = 'postgresql';

try {
  // Try PostgreSQL
  const { Pool } = require('pg');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'pos_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };

  db = new Pool(dbConfig);
  
  // Test connection
  db.connect().then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  }).catch(err => {
    console.log('❌ PostgreSQL connection failed, switching to SQLite...');
    setupSQLite();
  });

} catch (error) {
  console.log('PostgreSQL not available, using SQLite...');
  setupSQLite();
}

function setupSQLite() {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, '..', 'pos_app.db');
    
    dbType = 'sqlite';
    
    // SQLite wrapper to match PostgreSQL interface
    const sqliteDb = new sqlite3.Database(dbPath);
    
    db = {
      query: (text, params = []) => {
        return new Promise((resolve, reject) => {
          if (text.trim().toUpperCase().startsWith('SELECT')) {
            sqliteDb.all(text, params, (err, rows) => {
              if (err) reject(err);
              else resolve({ rows });
            });
          } else {
            sqliteDb.run(text, params, function(err) {
              if (err) reject(err);
              else resolve({ 
                rows: [], 
                rowCount: this.changes,
                insertId: this.lastID 
              });
            });
          }
        });
      },
      connect: () => Promise.resolve({
        query: db.query,
        release: () => {}
      }),
      end: () => Promise.resolve()
    };
    
    console.log('✅ SQLite database ready for immediate use');
    
  } catch (error) {
    console.error('❌ Both PostgreSQL and SQLite failed:', error.message);
    throw error;
  }
}

module.exports = { db, dbType };