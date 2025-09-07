// Customer handlers for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from './supabase-client';

const customerRouter = Router({ base: '/api/customers' });

// Get all customers
customerRouter.get('/', async (request) => {
  try {
    const supabase = createSupabaseClient(request.env);
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ customers }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch customers',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Create new customer
customerRouter.post('/', async (request) => {
  try {
    const customerData = await request.json();
    const supabase = createSupabaseClient(request.env);
    
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ customer }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to create customer',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Get customer by ID
customerRouter.get('/:id', async (request) => {
  try {
    const id = request.params.id;
    const supabase = createSupabaseClient(request.env);
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ customer }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch customer',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Update customer
customerRouter.put('/:id', async (request) => {
  try {
    const id = request.params.id;
    const customerData = await request.json();
    const supabase = createSupabaseClient(request.env);
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ customer }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to update customer',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Delete customer
customerRouter.delete('/:id', async (request) => {
  try {
    const id = request.params.id;
    const supabase = createSupabaseClient(request.env);
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ message: 'Customer deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to delete customer',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

export async function handleCustomers(request) {
  return customerRouter.handle(request);
}