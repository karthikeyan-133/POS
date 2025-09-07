// Supabase client for Cloudflare Workers
import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key are required');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}