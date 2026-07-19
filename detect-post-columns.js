import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfzidlhfplczcatfenfx.supabase.co';
const supabaseAnonKey = 'sb_publishable_qGHHx8NSSn7OnP3fV1sMtw_A5SaB850';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const names = [
  'id', 'userid', 'userId', 'type', 'title', 'description', 'category', 'photo',
  'location', 'lastseen', 'lastSeen', 'status', 'createdat', 'createdAt', 'comments', 'ratings'
];

async function check() {
  for (const name of names) {
    const { data, error } = await supabase.from('posts').select(name).limit(1);
    console.log(name, error ? '❌' : '✅', error ? error.message : 'OK');
  }
}

check().catch(err => console.error(err));