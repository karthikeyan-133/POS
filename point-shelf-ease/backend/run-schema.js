const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('./config/database-mysql');

async function runSchema() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connection successful!\n');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema-mysql.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema file...\n');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    let tableCount = 0;
    let indexCount = 0;
    
    for (const statement of statements) {
      if (statement.toUpperCase().startsWith('CREATE TABLE')) {
        try {
          await query(statement);
          tableCount++;
          console.log(`✅ Created table ${tableCount}`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`⚠️  Table already exists`);
          } else {
            console.error(`❌ Error creating table:`, error.message);
            // Continue with other statements
          }
        }
      } else if (statement.toUpperCase().startsWith('CREATE INDEX')) {
        try {
          await query(statement);
          indexCount++;
          console.log(`✅ Created index ${indexCount}`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`⚠️  Index already exists`);
          } else {
            console.error(`❌ Error creating index:`, error.message);
            // Continue with other statements
          }
        }
      }
    }
    
    console.log(`\n🎉 Schema execution completed!`);
    console.log(`Tables created: ${tableCount}`);
    console.log(`Indexes created: ${indexCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema execution failed:', error.message);
    process.exit(1);
  }
}

// Run the schema
if (require.main === module) {
  runSchema();
}