import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Có đủ URL và anon key thì dùng Supabase thật, ngược lại dùng dữ liệu mẫu
export const USE_SUPABASE = Boolean(url && key);
export const supabase = USE_SUPABASE ? createClient(url, key) : null;
