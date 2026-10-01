import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
