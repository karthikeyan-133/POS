// Expense handlers for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from './supabase-client';

const expenseRouter = Router({ base: '/api/expenses' });

// Get all expenses
expenseRouter.get('/', async (request) => {
  try {
    const supabase = createSupabaseClient(request.env);
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ expenses }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch expenses',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Create new expense
expenseRouter.post('/', async (request) => {
  try {
    const expenseData = await request.json();
    const supabase = createSupabaseClient(request.env);
    
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ expense }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to create expense',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

export async function handleExpenses(request) {
  return expenseRouter.handle(request);
}