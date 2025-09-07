const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      whereClause = `WHERE name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }
    
    // Add pagination
    paramCount++;
    const limitClause = `LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    const offsetClause = `OFFSET $${paramCount}`;
    params.push(offset);
    
    const result = await query(
      `SELECT * FROM customers 
       ${whereClause} 
       ORDER BY created_at DESC 
       ${limitClause} ${offsetClause}`,
      params
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      search ? [`%${search}%`] : []
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      customers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address, city, country } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingCustomer = await query(
        'SELECT id FROM customers WHERE email = $1',
        [email]
      );

      if (existingCustomer.rows.length > 0) {
        return res.status(409).json({ error: 'Customer with this email already exists' });
      }
    }

    const result = await query(
      `INSERT INTO customers (name, email, phone, address, city, country) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, email, phone, address, city, country]
    );

    res.status(201).json({
      message: 'Customer created successfully',
      customer: result.rows[0]
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ 
      error: 'Failed to create customer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, country } = req.body;

    // Check if customer exists
    const existingCustomer = await query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if email is being changed and if it conflicts
    if (email && email !== existingCustomer.rows[0].email) {
      const emailConflict = await query(
        'SELECT id FROM customers WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailConflict.rows.length > 0) {
        return res.status(409).json({ error: 'Customer with this email already exists' });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
    }
    if (email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      values.push(email);
    }
    if (phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      values.push(phone);
    }
    if (address !== undefined) {
      paramCount++;
      updateFields.push(`address = $${paramCount}`);
      values.push(address);
    }
    if (city !== undefined) {
      paramCount++;
      updateFields.push(`city = $${paramCount}`);
      values.push(city);
    }
    if (country !== undefined) {
      paramCount++;
      updateFields.push(`country = $${paramCount}`);
      values.push(country);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    values.push(id);

    const result = await query(
      `UPDATE customers SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    res.json({
      message: 'Customer updated successfully',
      customer: result.rows[0]
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ 
      error: 'Failed to update customer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const existingCustomer = await query(
      'SELECT id FROM customers WHERE id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer has any sales (you might want to prevent deletion)
    const salesCount = await query(
      'SELECT COUNT(*) as count FROM sales WHERE customer_id = $1',
      [id]
    );

    if (parseInt(salesCount.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing sales records' 
      });
    }

    await query('DELETE FROM customers WHERE id = $1', [id]);

    res.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ 
      error: 'Failed to delete customer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get customer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer: result.rows[0] });

  } catch (error) {
    console.error('Fetch customer error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Search customers by name
router.get('/search/:name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.params;

    const result = await query(
      `SELECT * FROM customers 
       WHERE name ILIKE $1 
       ORDER BY name ASC 
       LIMIT 20`,
      [`%${name}%`]
    );

    res.json({ customers: result.rows });

  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({ 
      error: 'Failed to search customers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;