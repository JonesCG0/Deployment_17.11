import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Deprecated alias for better-sqlite3 compatibility layer refactors
export function getDb() {
  throw new Error('getDb() with better-sqlite3 is deprecated. Use the supabase exported client.');
}
