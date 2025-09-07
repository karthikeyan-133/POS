// Cloudflare Worker for POS Backend API
import { Router } from 'itty-router';
import { handleAuth } from './auth';
import { handleCustomers } from './customers';
import { handleSuppliers } from './suppliers';
import { handleProducts } from './products';
import { handleExpenses } from './expenses';

// Create router instance
const router = Router();

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
router.options('*', () => new Response(null, { headers: corsHeaders }));

// Health check
router.get('/api/health', () => {
  return new Response(JSON.stringify({
    status: 'Worker is running',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// Route handlers
router.all('/api/auth/*', handleAuth);
router.all('/api/customers/*', handleCustomers);
router.all('/api/suppliers/*', handleSuppliers);
router.all('/api/products/*', handleProducts);
router.all('/api/expenses/*', handleExpenses);

// 404 handler
router.all('*', () => {
  return new Response(JSON.stringify({ error: 'Route not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// Main worker entry point
export default {
  async fetch(request, env, ctx) {
    try {
      // Add environment and context to request for handlers to use
      request.env = env;
      request.ctx = ctx;
      
      const response = await router.handle(request);
      
      // Add CORS headers to all responses
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};