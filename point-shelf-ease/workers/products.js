// Product handlers for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from './supabase-client';

const productRouter = Router({ base: '/api/products' });

// Get all products
productRouter.get('/', async (request) => {
  try {
    const supabase = createSupabaseClient(request.env);
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ products }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch products',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Create new product
productRouter.post('/', async (request) => {
  try {
    const productData = await request.json();
    const supabase = createSupabaseClient(request.env);
    
    const { data: product, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ product }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to create product',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

export async function handleProducts(request) {
  return productRouter.handle(request);
}