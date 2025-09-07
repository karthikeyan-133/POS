const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('./config/database-mysql');

// Read the schema file
const schemaPath = path.join(__dirname, 'database', 'schema-mysql.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

// Split the schema into individual statements
const statements = schemaSQL
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

async function initDatabase() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connection successful!\n');
    
    console.log('Initializing database tables...\n');
    
    // First, execute all CREATE TABLE statements
    const tableStatements = statements.filter(stmt => 
      stmt.toUpperCase().startsWith('CREATE TABLE')
    );
    
    console.log('Creating tables...');
    for (let i = 0; i < tableStatements.length; i++) {
      const statement = tableStatements[i];
      // Extract table name
      const tableNameMatch = statement.match(/CREATE TABLE.*?IF NOT EXISTS\s+(\w+)/i);
      const tableName = tableNameMatch ? tableNameMatch[1] : `Table ${i + 1}`;
      
      try {
        await query(statement);
        console.log(`✅ Created table: ${tableName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Table already exists: ${tableName}`);
        } else {
          console.error(`❌ Error creating table ${tableName}:`, error.message);
          throw error;
        }
      }
    }
    
    // Then, execute all CREATE INDEX statements
    const indexStatements = statements.filter(stmt => 
      stmt.toUpperCase().startsWith('CREATE INDEX')
    );
    
    console.log('\nCreating indexes...');
    for (let i = 0; i < indexStatements.length; i++) {
      const statement = indexStatements[i];
      try {
        await query(statement);
        console.log(`✅ Created index`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Index already exists`);
        } else {
          console.error(`❌ Error creating index:`, error.message);
          // Don't throw error for indexes as they're not critical
        }
      }
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initDatabase();
}