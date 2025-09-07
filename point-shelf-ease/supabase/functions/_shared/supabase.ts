import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

export const supabase = createClient(
  'https://nqqvsrsnvrxydborkfsv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcXZzcnNudnJ4eWRib3JrZnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODg2NjMsImV4cCI6MjA3MDY2NDY2M30.N9fm57nGk9g6-HEjP7jOTPcXUxQifRPEfLI18BCSEic'
);