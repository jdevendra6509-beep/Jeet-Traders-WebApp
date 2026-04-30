import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Use a dummy URL to prevent createClient from crashing if env vars are missing.
export const supabase = createClient(
  supabaseUrl || 'https://dummy-project.supabase.co', 
  supabaseAnonKey || 'dummy-key'
);
