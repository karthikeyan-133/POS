// Database Configuration for cPanel MySQL
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import MySQL adapter
const mysqlAdapter = require('./database-mysql');

// Use MySQL as primary database
let currentAdapter = mysqlAdapter;

console.log('🚀 Using MySQL as the database backend');

// Export the current adapter's methods
module.exports = {
  query: currentAdapter.query,
  transaction: currentAdapter.transaction,
  testConnection: currentAdapter.testConnection,
  isSupabase: false
};