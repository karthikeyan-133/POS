// Supplier handlers for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from './supabase-client';

const supplierRouter = Router({ base: '/api/suppliers' });

// Get all suppliers
supplierRouter.get('/', async (request) => {
  try {
    const supabase = createSupabaseClient(request.env);
    
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ suppliers }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch suppliers',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Create new supplier
supplierRouter.post('/', async (request) => {
  try {
    const supplierData = await request.json();
    const supabase = createSupabaseClient(request.env);
    
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ supplier }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to create supplier',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

export async function handleSuppliers(request) {
  return supplierRouter.handle(request);
}