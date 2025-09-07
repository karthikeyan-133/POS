const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('./config/database-mysql');

async function initSchema() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connection successful!\n');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema-mysql.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Parsing schema file...\n');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Separate table creation and index creation statements
    const tableStatements = statements.filter(stmt => 
      stmt.toUpperCase().includes('CREATE TABLE IF NOT EXISTS')
    );
    
    const indexStatements = statements.filter(stmt => 
      stmt.toUpperCase().startsWith('CREATE INDEX')
    );
    
    console.log(`Found ${tableStatements.length} table creation statements`);
    console.log(`Found ${indexStatements.length} index creation statements\n`);
    
    // Execute table creation statements first
    console.log('Creating tables...');
    let tablesCreated = 0;
    for (const statement of tableStatements) {
      try {
        await query(statement);
        tablesCreated++;
        // Extract table name for better logging
        const tableNameMatch = statement.match(/CREATE TABLE.*?IF NOT EXISTS\s+(\w+)/i);
        const tableName = tableNameMatch ? tableNameMatch[1] : 'Unknown';
        console.log(`✅ Created table: ${tableName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          const tableNameMatch = statement.match(/CREATE TABLE.*?IF NOT EXISTS\s+(\w+)/i);
          const tableName = tableNameMatch ? tableNameMatch[1] : 'Unknown';
          console.log(`⚠️  Table already exists: ${tableName}`);
        } else {
          console.error(`❌ Error creating table:`, error.message);
          throw error; // Stop on table creation errors
        }
      }
    }
    
    // Execute index creation statements after tables
    console.log('\nCreating indexes...');
    let indexesCreated = 0;
    for (const statement of indexStatements) {
      try {
        await query(statement);
        indexesCreated++;
        console.log(`✅ Created index`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Index already exists`);
        } else {
          console.error(`❌ Error creating index:`, error.message);
          // Don't stop on index errors as they're not critical
        }
      }
    }
    
    console.log(`\n🎉 Schema initialization completed!`);
    console.log(`Tables created: ${tablesCreated}`);
    console.log(`Indexes created: ${indexesCreated}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema initialization failed:', error.message);
    process.exit(1);
  }
}

// Run the schema initialization
if (require.main === module) {
  initSchema();
}