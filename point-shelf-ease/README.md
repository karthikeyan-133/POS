# 🛒 POS System - Point of Sale Application

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-green.svg)](https://mysql.com/)

A modern Point of Sale (POS) system built with React, TypeScript, Node.js, and MySQL.

## Features

- Sales Management & POS Interface
- Inventory Control & Stock Tracking
- Customer & Supplier Management
- Expense Tracking with Receipt Uploads
- Financial Reports & Analytics
- Secure Authentication (JWT + Google Sign-in)
- Responsive Design (Desktop, Tablet, Mobile)

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL database (cPanel, local, or cloud)

### Setup

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd point-shelf-ease
   npm install
   cd backend && npm install && cd ..
   ```

2. **Environment Variables**
   
   Create `.env` in root:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   
   Create `backend/.env`:
   ```env
   # cPanel Database Configuration
   DB_HOST=your-cpanel-hostname.com
   DB_PORT=3306
   DB_NAME=your_cpanel_database_name
   DB_USER=your_cpanel_database_user
   DB_PASSWORD=your_cpanel_database_password
   DB_SSL=true
   
   # Server Configuration
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

3. **Start Development**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Create your first admin account by registering

## Deployment

### Cloudflare (Recommended)
1. **Backend (Workers)**: `npm run deploy:worker`
2. **Frontend (Pages)**: Connect Git repo to Cloudflare Pages
3. Set environment variables in Cloudflare dashboard

## Database Setup with cPanel

This POS system can be configured to work with a cPanel MySQL database. Follow these steps:

1. **Create Database in cPanel**
   - Log in to your cPanel
   - Navigate to "MySQL Databases"
   - Create a new database and user
   - Assign the user to the database with all privileges

2. **Update Environment Variables**
   - Edit `backend/.env` with your cPanel database credentials
   - Set `DB_SSL=true` for secure connections

3. **Import Database Schema**
   - Use the provided `backend/database/schema-mysql.sql` file
   - Import it through phpMyAdmin in cPanel
   - Or run the SQL commands manually

4. **Test Connection**
   - Run `npm run test-db` to verify the connection
   - Check the console for success messages

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, JWT
- **Database**: MySQL (via cPanel or local)
- **Hosting**: Cloudflare Workers + Pages

## License

MIT License - see [LICENSE](LICENSE) file.

---

**Modern POS system ready for production deployment!** 🚀
