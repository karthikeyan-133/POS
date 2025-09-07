const express = require('express');
const { query, transaction } = require('../config/database');
const { authenticateToken } = require('./auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only jpeg, jpg, png, and pdf files are allowed'));
    }
  }
});

// Generate expense reference number
async function generateExpenseReference() {
  try {
    const result = await query(
      `SELECT reference FROM expenses 
       WHERE reference LIKE 'EXP-%' 
       ORDER BY created_at DESC 
       LIMIT 1`
    );
    
    if (result.rows.length === 0) {
      return 'EXP-000001';
    }
    
    const lastRef = result.rows[0].reference;
    const lastNum = parseInt(lastRef.split('-')[1]) || 0;
    const nextNum = lastNum + 1;
    return `EXP-${String(nextNum).padStart(6, '0')}`;
    
  } catch (error) {
    console.error('Error generating reference:', error);
    return `EXP-${Date.now()}`;
  }
}

// Get all expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    let paramCount = 0;
    
    // Add filters
    if (category) {
      paramCount++;
      whereClause += ` WHERE expense_category = $${paramCount}`;
      params.push(category);
    }
    
    if (startDate && endDate) {
      paramCount++;
      const dateClause = `expense_date >= $${paramCount}`;
      params.push(startDate);
      
      paramCount++;
      const endDateClause = `expense_date <= $${paramCount}`;
      params.push(endDate);
      
      whereClause += whereClause ? ` AND ${dateClause} AND ${endDateClause}` : ` WHERE ${dateClause} AND ${endDateClause}`;
    }
    
    // Add pagination
    paramCount++;
    const limitClause = `LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    const offsetClause = `OFFSET $${paramCount}`;
    params.push(offset);
    
    const result = await query(
      `SELECT * FROM expenses 
       ${whereClause} 
       ORDER BY created_at DESC 
       ${limitClause} ${offsetClause}`,
      params
    );

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total FROM expenses ${whereClause}`,
      params.slice(0, -2) // Remove limit and offset params
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      expenses: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch expenses error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch expenses',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new expense
router.post('/', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    const {
      expense_date,
      amount,
      expense_category,
      user_name,
      store_location,
      tax = 0,
      notes
    } = req.body;

    // Validate required fields
    if (!expense_date || !amount || !expense_category || !user_name || !store_location) {
      return res.status(400).json({ 
        error: 'Missing required fields: expense_date, amount, expense_category, user_name, store_location' 
      });
    }

    // Generate reference
    const reference = await generateExpenseReference();
    
    // Calculate total tax
    const totalTax = (parseFloat(amount) * parseFloat(tax)) / 100;
    
    // Handle file upload
    let receiptFileUrl = null;
    let receiptFileName = null;
    
    if (req.file) {
      receiptFileUrl = `/uploads/${req.file.filename}`;
      receiptFileName = req.file.originalname;
    }

    const result = await query(
      `INSERT INTO expenses (
        reference, expense_date, amount, expense_category, 
        user_name, store_location, tax, total_tax,
        receipt_file_url, receipt_file_name, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        reference, expense_date, amount, expense_category,
        user_name, store_location, tax, totalTax,
        receiptFileUrl, receiptFileName, notes, req.user.userId
      ]
    );

    res.status(201).json({
      message: 'Expense created successfully',
      expense: result.rows[0]
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ 
      error: 'Failed to create expense',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update expense
router.put('/:id', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      expense_date,
      amount,
      expense_category,
      user_name,
      store_location,
      tax = 0,
      notes
    } = req.body;

    // Check if expense exists
    const existingExpense = await query(
      'SELECT * FROM expenses WHERE id = $1',
      [id]
    );

    if (existingExpense.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Calculate total tax
    const totalTax = amount ? (parseFloat(amount) * parseFloat(tax)) / 100 : existingExpense.rows[0].total_tax;
    
    // Handle file upload
    let receiptFileUrl = existingExpense.rows[0].receipt_file_url;
    let receiptFileName = existingExpense.rows[0].receipt_file_name;
    
    if (req.file) {
      receiptFileUrl = `/uploads/${req.file.filename}`;
      receiptFileName = req.file.originalname;
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (expense_date) {
      paramCount++;
      updateFields.push(`expense_date = $${paramCount}`);
      values.push(expense_date);
    }
    if (amount) {
      paramCount++;
      updateFields.push(`amount = $${paramCount}`);
      values.push(amount);
    }
    if (expense_category) {
      paramCount++;
      updateFields.push(`expense_category = $${paramCount}`);
      values.push(expense_category);
    }
    if (user_name) {
      paramCount++;
      updateFields.push(`user_name = $${paramCount}`);
      values.push(user_name);
    }
    if (store_location) {
      paramCount++;
      updateFields.push(`store_location = $${paramCount}`);
      values.push(store_location);
    }
    if (tax !== undefined) {
      paramCount++;
      updateFields.push(`tax = $${paramCount}`);
      values.push(tax);
      
      paramCount++;
      updateFields.push(`total_tax = $${paramCount}`);
      values.push(totalTax);
    }
    if (receiptFileUrl) {
      paramCount++;
      updateFields.push(`receipt_file_url = $${paramCount}`);
      values.push(receiptFileUrl);
      
      paramCount++;
      updateFields.push(`receipt_file_name = $${paramCount}`);
      values.push(receiptFileName);
    }
    if (notes !== undefined) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      values.push(notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    values.push(id);

    const result = await query(
      `UPDATE expenses SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    res.json({
      message: 'Expense updated successfully',
      expense: result.rows[0]
    });

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ 
      error: 'Failed to update expense',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if expense exists
    const existingExpense = await query(
      'SELECT receipt_file_url FROM expenses WHERE id = $1',
      [id]
    );

    if (existingExpense.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete the expense
    await query('DELETE FROM expenses WHERE id = $1', [id]);

    // Optionally delete the file
    const expense = existingExpense.rows[0];
    if (expense.receipt_file_url) {
      const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', path.basename(expense.receipt_file_url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Expense deleted successfully' });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ 
      error: 'Failed to delete expense',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get expense by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM expenses WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ expense: result.rows[0] });

  } catch (error) {
    console.error('Fetch expense error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch expense',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;