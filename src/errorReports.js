import { supabase } from './supabaseClient';

export async function createErrorReport({ title, message, url, user }) {
  const payload = {
    title: title || null,
    message: message || null,
    url: url || null,
    user_info: user || null,
  };

  const { data, error } = await supabase.from('error_reports').insert([payload]);
  return { data, error };
}

export async function listErrorReports(limit = 50) {
  const { data, error } = await supabase
    .from('error_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
}
