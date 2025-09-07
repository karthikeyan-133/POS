// Test database connection script
const { testConnection } = require('./config/database');

async function testDB() {
  console.log('Testing database connection...');
  try {
    await testConnection();
    console.log('✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
  process.exit(0);
}

testDB();