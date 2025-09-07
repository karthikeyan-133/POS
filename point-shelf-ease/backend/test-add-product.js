const { query, transaction } = require('./config/database');

async function testAddProduct() {
  try {
    console.log('Testing product creation...\n');
    
    // Test product data
    const productData = {
      name: 'Test Product',
      description: 'A test product for verification',
      sku: 'TEST001',
      barcode: '123456789012',
      cost_price: 10.50,
      selling_price: 15.99,
      stock_quantity: 100,
      min_stock_level: 10,
      unit: 'pcs',
      tax_rate: 5.00
    };
    
    console.log('Inserting test product...');
    
    // Insert product using the fixed MySQL syntax
    const result = await transaction(async (client) => {
      // Insert product
      const productResult = await client.query(
        `INSERT INTO products (
          name, description, sku, barcode, 
          cost_price, selling_price, stock_quantity, min_stock_level,
          unit, tax_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productData.name, productData.description, productData.sku, productData.barcode,
          productData.cost_price, productData.selling_price, productData.stock_quantity, 
          productData.min_stock_level, productData.unit, productData.tax_rate
        ]
      );
      
      // Get the inserted product with its ID
      const insertedId = productResult[0].insertId;
      const insertedProduct = await client.query(
        'SELECT * FROM products WHERE id = ?',
        [insertedId]
      );
      
      const product = insertedProduct[0][0];
      
      // Create initial stock movement if stock_quantity > 0
      if (productData.stock_quantity > 0) {
        await client.query(
          `INSERT INTO stock_movements (
            product_id, movement_type, quantity, reference_type, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            product.id, 'adjustment', productData.stock_quantity, 'initial_stock',
            'Initial stock entry', 1 // Assuming user ID 1 for test
          ]
        );
      }
      
      return product;
    });
    
    console.log('✅ Product created successfully!');
    console.log('Product ID:', result.id);
    console.log('Product Name:', result.name);
    console.log('SKU:', result.sku);
    
    // Verify the product was added
    console.log('\nVerifying product in database...');
    const verifyResult = await query(
      'SELECT COUNT(*) as count FROM products WHERE sku = ?',
      [productData.sku]
    );
    
    console.log(`Product count with SKU ${productData.sku}:`, verifyResult.rows[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testAddProduct();
}