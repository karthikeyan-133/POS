const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const customerRoutes = require('./routes/customers');
const supplierRoutes = require('./routes/suppliers');
const productRoutes = require('./routes/products');

// Load environment variables from correct path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Vercel serverless function export
module.exports = app;
module.exports.app = app;

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await testConnection();
    console.log('✅ MySQL database connected successfully');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.log('👉 Please check your MySQL configuration in the .env file');
    // Don't exit - the app can still work with frontend-only features
    console.log('⚠️  Starting server anyway - some features may be limited');
  }
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://your-app-name.netlify.app',
    'https://your-app-name.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database connection
async function init() {
  try {
    await testDatabaseConnection();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

// Initialize on cold start
if (process.env.NOW_REGION) {
  // Vercel environment
  init();
} else if (require.main === module) {
  // Local development
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n✅ Server started successfully!');
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
    console.log('\n🔐 Create your admin account by registering in the application.\n');
  });
}