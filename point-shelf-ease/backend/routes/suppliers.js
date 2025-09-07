const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all suppliers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      whereClause = `WHERE name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR contact_person ILIKE $${paramCount}`;
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
      `SELECT * FROM suppliers 
       ${whereClause} 
       ORDER BY created_at DESC 
       ${limitClause} ${offsetClause}`,
      params
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM suppliers ${whereClause}`,
      search ? [`%${search}%`] : []
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      suppliers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch suppliers error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch suppliers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new supplier
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address, city, country, contact_person } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const result = await query(
      `INSERT INTO suppliers (name, email, phone, address, city, country, contact_person) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, email, phone, address, city, country, contact_person]
    );

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier: result.rows[0]
    });

  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ 
      error: 'Failed to create supplier',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update supplier
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, country, contact_person } = req.body;

    // Check if supplier exists
    const existingSupplier = await query(
      'SELECT * FROM suppliers WHERE id = $1',
      [id]
    );

    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
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
    if (contact_person !== undefined) {
      paramCount++;
      updateFields.push(`contact_person = $${paramCount}`);
      values.push(contact_person);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    values.push(id);

    const result = await query(
      `UPDATE suppliers SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    res.json({
      message: 'Supplier updated successfully',
      supplier: result.rows[0]
    });

  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ 
      error: 'Failed to update supplier',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete supplier
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const existingSupplier = await query(
      'SELECT id FROM suppliers WHERE id = $1',
      [id]
    );

    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Check if supplier has any purchases
    const purchasesCount = await query(
      'SELECT COUNT(*) as count FROM purchases WHERE supplier_id = $1',
      [id]
    );

    if (parseInt(purchasesCount.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete supplier with existing purchase records' 
      });
    }

    await query('DELETE FROM suppliers WHERE id = $1', [id]);

    res.json({ message: 'Supplier deleted successfully' });

  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ 
      error: 'Failed to delete supplier',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get supplier by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM suppliers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ supplier: result.rows[0] });

  } catch (error) {
    console.error('Fetch supplier error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch supplier',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;