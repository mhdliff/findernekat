import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gfzidlhfplczcatfenfx.supabase.co";
const supabaseAnonKey = "sb_publishable_qGHHx8NSSn7OnP3fV1sMtw_A5SaB850";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log("🔍 Getting posts table schema...\n");

  // Query information_schema
  const { data, error } = await supabase.rpc('getTableSchema', { table_name: 'posts' }).catch(() => null);
  
  if (error || !data) {
    console.log("RPC not available. Trying direct query...\n");
    
    // Try ambil struktur dengan SELECT
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select()
      .limit(0);  // Fetch 0 rows but get schema info
    
    if (postsError) {
      console.log("❌ Error:", postsError);
    } else {
      console.log("✅ Query successful (but no data)");
    }
  }

  // Coba insert dengan semua kombinasi nama kolom
  console.log("\n🧪 Testing different column name combinations...\n");
  
  const tests = [
    { name: "snake_case", payload: { id: `p1`, user_id: "u1", type: "lost", title: "T", description: "D", category: "C", last_seen: new Date().toISOString() } },
    { name: "camelCase", payload: { id: `p2`, userId: "u1", type: "lost", title: "T", description: "D", category: "C", lastSeen: new Date().toISOString() } },
    { name: "minimal", payload: { id: `p3`, type: "lost", title: "T" } },
  ];

  for (const test of tests) {
    const { error } = await supabase.from("posts").insert([test.payload]);
    console.log(`${test.name}: ${error ? '❌ ' + error.message : '✅ OK'}`);
  }
}

checkSchema().catch(console.error);
