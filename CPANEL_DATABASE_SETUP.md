# cPanel Database Setup Guide for POS Application

This guide will help you set up a MySQL database in cPanel and connect it to your POS application.

## Step 1: Create Database in cPanel

1. Log in to your cPanel
2. Navigate to the "MySQL Databases" section
3. Create a new database:
   - Database name: `pos_app` (or any name you prefer)
4. Create a new database user:
   - Username: Choose a username
   - Password: Create a strong password
5. Assign the user to the database:
   - Select your user and database
   - Grant ALL privileges

## Step 2: Update Your Environment Variables

Update the [.env](file:///C:/Users/TECHZON-17/Desktop/POS%20APP/point-shelf-ease/backend/.env) file in `point-shelf-ease/backend/.env` with your cPanel database credentials:

```env
# cPanel Database Configuration
DB_HOST=your-cpanel-hostname.com     # Replace with your cPanel host (e.g., yourdomain.com or localhost)
DB_PORT=3306
DB_NAME=your_cpanel_database_name    # Replace with your database name
DB_USER=your_cpanel_database_user    # Replace with your database username
DB_PASSWORD=your_cpanel_database_password  # Replace with your database password
DB_SSL=true
```

## Step 3: Import Database Schema

You have two options to create the required tables:

### Option A: Import SQL File (Recommended)

1. Download the schema file: `point-shelf-ease/backend/database/schema-mysql.sql`
2. In cPanel, go to "phpMyAdmin"
3. Select your database
4. Click on the "Import" tab
5. Choose the schema-mysql.sql file
6. Click "Go" to import

### Option B: Run SQL Commands Manually

Copy and paste the following SQL commands into phpMyAdmin SQL editor:

```sql
-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    contact_person VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    category_id INT,
    supplier_id INT,
    cost_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pcs',
    tax_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) UNIQUE NOT NULL,
    expense_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_category VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    store_location VARCHAR(255) NOT NULL,
    tax DECIMAL(5,2) DEFAULT 0,
    total_tax DECIMAL(10,2) DEFAULT 0,
    receipt_file_url TEXT,
    receipt_file_name VARCHAR(255),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT,
    user_id INT NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_status ENUM('paid', 'pending', 'partial') DEFAULT 'paid',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT,
    user_id INT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('paid', 'pending', 'partial') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Purchase items table
CREATE TABLE IF NOT EXISTS purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Stock movements table for inventory tracking
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    movement_type ENUM('sale', 'purchase', 'adjustment', 'return') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
```

## Step 4: Test the Connection

1. Restart your backend server:
   ```bash
   cd point-shelf-ease
   npm run dev:backend
   ```

2. Check the console for connection messages:
   - Look for "✅ MySQL database connected successfully" message
   - If there's an error, double-check your credentials

## Step 5: Create Initial Admin User (Optional)

After the database is set up, you may want to create an initial admin user. You can do this by running the backend and using the registration API endpoint, or by manually inserting a user into the database.

## Troubleshooting

### Common Issues:

1. **Connection Refused**: 
   - Check that your database host is correct
   - Verify database user permissions
   - Confirm the database exists

2. **Authentication Failed**:
   - Double-check username and password
   - Ensure the user is assigned to the database

3. **SSL Connection Issues**:
   - Try setting DB_SSL=false in your .env file

4. **Table Creation Errors**:
   - Make sure you're using MySQL 5.7 or higher
   - Check that your database user has CREATE privileges

### Getting Database Credentials from cPanel:

1. Database Host: Usually your domain name or `localhost`
2. Database Name: The name you created in cPanel (usually prefixed with your cPanel username)
3. Database User: The username you created (usually prefixed with your cPanel username)
4. Database Password: The password you set for the database user

Example:
- Host: `yourdomain.com` or `localhost`
- Database: `yourcpanelusername_pos_app`
- User: `yourcpanelusername_pos_user`
- Password: `your_secure_password`