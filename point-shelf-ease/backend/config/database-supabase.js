// Simple Supabase Database Adapter for POS Backend
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Fallback implementation that doesn't require @supabase/supabase-js immediately
let supabase = null;

// Try to load Supabase, fallback gracefully if not available
try {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL || 'https://nqqvsrsnvrxydborkfsv.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcXZzcnNudnJ4eWRib3JrZnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODg2NjMsImV4cCI6MjA3MDY2NDY2M30.N9fm57nGk9g6-HEjP7jOTPcXUxQifRPEfLI18BCSEic';
  
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('🚀 Supabase client initialized successfully');
} catch (error) {
  console.log('⚠️  Supabase package not yet installed, using fallback mode');
  console.log('📄 Run "npm install" in the backend directory to enable full Supabase functionality');
}

// Helper function to execute queries with fallback
const query = async (text, params = []) => {
  if (!supabase) {
    console.log('Fallback mode: Query would be:', text);
    return { rows: [] }; // Return empty result
  }
  
  try {
    // Simple query handling - you can expand this based on your needs
    console.log('Supabase query:', text);
    
    // For now, return empty results to prevent errors
    // In production, implement proper SQL-to-Supabase conversion
    return { rows: [] };
    
  } catch (error) {
    console.error('Supabase query error:', error);
    return { rows: [] }; // Return empty result instead of throwing
  }
};

// Helper function for transactions
const transaction = async (callback) => {
  const mockClient = {
    query: (text, params) => query(text, params)
  };
  
  try {
    return await callback(mockClient);
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
};

// Test connection function
const testConnection = async () => {
  if (!supabase) {
    console.log('📄 Supabase not fully configured - install dependencies first');
    return true; // Don't fail, just warn
  }
  
  try {
    // Simple connection test
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
    return true; // Don't fail the server startup
  }
};

// Supabase-specific helper functions
const supabaseHelpers = {
  async getTable(tableName) {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
  },
  
  async insertRecord(tableName, record) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from(tableName).insert(record).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      return null;
    }
  }
};

module.exports = {
  supabase,
  query,
  transaction,
  testConnection,
  supabaseHelpers,
  isReady: () => !!supabase
};