// Điểm duy nhất giao diện gọi dữ liệu. Không import mockApi/supabaseApi trực tiếp trong page.
import { USE_SUPABASE } from './supabaseClient';
import { mockApi } from './mockApi';
import { supabaseApi } from './supabaseApi';

export const api = USE_SUPABASE ? supabaseApi : mockApi;
