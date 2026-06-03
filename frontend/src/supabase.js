import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aeubserktlodehyzjlxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFldWJzZXJrdGxvZGVoeXpqbHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTg5OTgsImV4cCI6MjA5NTY5NDk5OH0.4UXQWx0DTDJXPcW7BfH7wm_HIiUbvCVzS8UoZ5rRdTs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
