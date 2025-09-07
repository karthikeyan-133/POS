const { query, testConnection } = require('./config/database-mysql');

async function checkTables() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connection successful!\n');
    
    console.log('Checking existing tables...\n');
    
    const result = await query('SHOW TABLES');
    console.log('Existing tables:');
    result.rows.forEach(row => {
      console.log('- ' + Object.values(row)[0]);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    process.exit(1);
  }
}

// Run the check
if (require.main === module) {
  checkTables();
}