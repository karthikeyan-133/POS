const { query, testConnection } = require('./config/database-mysql');

async function checkProductsTable() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connection successful!\n');
    
    console.log('Checking products table structure...\n');
    
    const result = await query('DESCRIBE products');
    console.log('Products table structure:');
    console.log('Field\t\tType\t\tNull\tKey\tDefault\tExtra');
    console.log('-----\t\t----\t\t----\t---\t-------\t-----');
    result.rows.forEach(row => {
      console.log(`${row.Field}\t\t${row.Type}\t${row.Null}\t${row.Key}\t${row.Default || ''}\t${row.Extra || ''}`);
    });
    
    console.log('\nChecking if there are any products in the table...');
    const countResult = await query('SELECT COUNT(*) as count FROM products');
    console.log(`Total products in database: ${countResult.rows[0].count}`);
    
    if (countResult.rows[0].count > 0) {
      console.log('\nSample products:');
      const sampleResult = await query('SELECT id, name, sku FROM products LIMIT 5');
      sampleResult.rows.forEach(row => {
        console.log(`ID: ${row.id}, Name: ${row.name}, SKU: ${row.sku}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking products table:', error.message);
    process.exit(1);
  }
}

// Run the check
if (require.main === module) {
  checkProductsTable();
}