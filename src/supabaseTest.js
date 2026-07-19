import { supabase } from './supabaseClient';

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...');
  
  // Test 1: Check credentials
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('✓ VITE_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
  console.log('✓ VITE_SUPABASE_ANON_KEY:', key ? '✅ Set' : '❌ Missing');
  
  if (!url || !key) {
    console.error('❌ Credentials missing! Create .env file.');
    return false;
  }
  
  try {
    // Test 2: Query users table
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Users table error:', error.message);
      return false;
    }
    console.log('✅ Users table exists');
    
    // Test 3: Query posts table
    const { data: posts, error: postsError } = await supabase.from('posts').select('count').limit(1);
    if (postsError) {
      console.error('❌ Posts table error:', postsError.message);
      return false;
    }
    console.log('✅ Posts table exists');
    
    console.log('✅ Supabase connection OK!');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err);
    return false;
  }
}

export async function debugPostsData() {
  const { data, error } = await supabase.from('posts').select('*');
  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }
  console.log('Posts in database:', data);
}
