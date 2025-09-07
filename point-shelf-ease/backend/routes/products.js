const express = require('express');
const { query, transaction } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category_id, active_only = 'true' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    let paramCount = 0;
    
    // Build where conditions
    const conditions = [];
    
    if (active_only === 'true') {
      paramCount++;
      conditions.push(`p.is_active = $${paramCount}`);
      params.push(true);
    }
    
    if (search) {
      paramCount++;
      conditions.push(`(p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount} OR p.barcode ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }
    
    if (category_id) {
      paramCount++;
      conditions.push(`p.category_id = $${paramCount}`);
      params.push(category_id);
    }
    
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add pagination
    paramCount++;
    const limitClause = `LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    const offsetClause = `OFFSET $${paramCount}`;
    params.push(offset);
    
    // Convert PostgreSQL-style $1, $2... to MySQL-style ?
    let sqlQuery = `SELECT p.*, c.name as category_name, s.name as supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       ${whereClause} 
       ORDER BY p.created_at DESC 
       ${limitClause} ${offsetClause}`;
    
    // Replace $1, $2... with ? for MySQL
    sqlQuery = sqlQuery.replace(/\$(\d+)/g, '?');
    
    const result = await query(sqlQuery, params);

    // Get total count
    const countParams = params.slice(0, -2); // Remove limit and offset
    let countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    
    // Replace $1, $2... with ? for MySQL
    countQuery = countQuery.replace(/\$(\d+)/g, '?');
    
    const countResult = await query(countQuery, countParams);
    
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      sku,
      barcode,
      category_id,
      supplier_id,
      cost_price,
      selling_price,
      stock_quantity = 0,
      min_stock_level = 0,
      unit = 'pcs',
      tax_rate = 0
    } = req.body;

    // Validate required fields
    if (!name || !sku || !cost_price || !selling_price) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, sku, cost_price, selling_price' 
      });
    }

    // Check if SKU already exists
    const existingSku = await query(
      'SELECT id FROM products WHERE sku = ?',
      [sku]
    );

    if (existingSku.rows.length > 0) {
      return res.status(409).json({ error: 'Product with this SKU already exists' });
    }

    // Check if barcode already exists (if provided)
    if (barcode) {
      const existingBarcode = await query(
        'SELECT id FROM products WHERE barcode = ?',
        [barcode]
      );

      if (existingBarcode.rows.length > 0) {
        return res.status(409).json({ error: 'Product with this barcode already exists' });
      }
    }

    const result = await transaction(async (client) => {
      // Insert product
      const productResult = await client.query(
        `INSERT INTO products (
          name, description, sku, barcode, category_id, supplier_id,
          cost_price, selling_price, stock_quantity, min_stock_level,
          unit, tax_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, description, sku, barcode, category_id, supplier_id,
          cost_price, selling_price, stock_quantity, min_stock_level,
          unit, tax_rate
        ]
      );
      
      // Get the inserted product with its ID
      const insertedProduct = await client.query(
        'SELECT * FROM products WHERE id = LAST_INSERT_ID()'
      );

      const product = insertedProduct.rows[0];

      // Create initial stock movement if stock_quantity > 0
      if (stock_quantity > 0) {
        await client.query(
          `INSERT INTO stock_movements (
            product_id, movement_type, quantity, reference_type, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            product.id, 'adjustment', stock_quantity, 'initial_stock',
            'Initial stock entry', req.user.userId
          ]
        );
      }

      return product;
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: result
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      sku,
      barcode,
      category_id,
      supplier_id,
      cost_price,
      selling_price,
      stock_quantity,
      min_stock_level,
      unit,
      tax_rate,
      is_active
    } = req.body;

    // Check if product exists
    const existingProduct = await query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentProduct = existingProduct.rows[0];

    // Check SKU conflicts
    if (sku && sku !== currentProduct.sku) {
      const skuConflict = await query(
        'SELECT id FROM products WHERE sku = ? AND id != ?',
        [sku, id]
      );

      if (skuConflict.rows.length > 0) {
        return res.status(409).json({ error: 'Product with this SKU already exists' });
      }
    }

    // Check barcode conflicts
    if (barcode && barcode !== currentProduct.barcode) {
      const barcodeConflict = await query(
        'SELECT id FROM products WHERE barcode = ? AND id != ?',
        [barcode, id]
      );

      if (barcodeConflict.rows.length > 0) {
        return res.status(409).json({ error: 'Product with this barcode already exists' });
      }
    }

    const result = await transaction(async (client) => {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCount = 0;

      if (name) {
        paramCount++;
        updateFields.push(`name = ?`);
        values.push(name);
      }
      if (description !== undefined) {
        paramCount++;
        updateFields.push(`description = ?`);
        values.push(description);
      }
      if (sku) {
        paramCount++;
        updateFields.push(`sku = ?`);
        values.push(sku);
      }
      if (barcode !== undefined) {
        paramCount++;
        updateFields.push(`barcode = ?`);
        values.push(barcode);
      }
      if (category_id !== undefined) {
        paramCount++;
        updateFields.push(`category_id = ?`);
        values.push(category_id);
      }
      if (supplier_id !== undefined) {
        paramCount++;
        updateFields.push(`supplier_id = ?`);
        values.push(supplier_id);
      }
      if (cost_price !== undefined) {
        paramCount++;
        updateFields.push(`cost_price = ?`);
        values.push(cost_price);
      }
      if (selling_price !== undefined) {
        paramCount++;
        updateFields.push(`selling_price = ?`);
        values.push(selling_price);
      }
      if (min_stock_level !== undefined) {
        paramCount++;
        updateFields.push(`min_stock_level = ?`);
        values.push(min_stock_level);
      }
      if (unit !== undefined) {
        paramCount++;
        updateFields.push(`unit = ?`);
        values.push(unit);
      }
      if (tax_rate !== undefined) {
        paramCount++;
        updateFields.push(`tax_rate = ?`);
        values.push(tax_rate);
      }
      if (is_active !== undefined) {
        paramCount++;
        updateFields.push(`is_active = ?`);
        values.push(is_active);
      }

      // Handle stock quantity change
      if (stock_quantity !== undefined && stock_quantity !== currentProduct.stock_quantity) {
        paramCount++;
        updateFields.push(`stock_quantity = $${paramCount}`);
        values.push(stock_quantity);

        // Record stock movement
        const difference = stock_quantity - currentProduct.stock_quantity;
        await client.query(
          `INSERT INTO stock_movements (
            product_id, movement_type, quantity, reference_type, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id, 'adjustment', difference, 'manual_adjustment',
            `Stock adjusted from ${currentProduct.stock_quantity} to ${stock_quantity}`,
            req.user.userId
          ]
        );
      }

      if (updateFields.length === 0) {
        return currentProduct;
      }

      values.push(id);

      const productResult = await client.query(
        `UPDATE products SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        values
      );

      return productResult.rows[0];
    });

    res.json({
      message: 'Product updated successfully',
      product: result
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product has any sales or purchase items
    const salesCount = await query(
      'SELECT COUNT(*) as count FROM sale_items WHERE product_id = ?',
      [id]
    );

    const purchasesCount = await query(
      'SELECT COUNT(*) as count FROM purchase_items WHERE product_id = ?',
      [id]
    );

    if (parseInt(salesCount.rows[0].count) > 0 || parseInt(purchasesCount.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product with existing sales or purchase records. Consider deactivating instead.' 
      });
    }

    await transaction(async (client) => {
      // Delete stock movements
      await client.query('DELETE FROM stock_movements WHERE product_id = $1', [id]);
      
      // Delete product
      await client.query('DELETE FROM products WHERE id = $1', [id]);
    });

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.*, c.name as category_name, s.name as supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });

  } catch (error) {
    console.error('Fetch product error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get low stock products
router.get('/alerts/low-stock', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock_quantity <= p.min_stock_level 
       AND p.is_active = true
       ORDER BY (p.stock_quantity - p.min_stock_level) ASC`,
      []
    );

    res.json({ products: result.rows });

  } catch (error) {
    console.error('Fetch low stock products error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch low stock products',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;