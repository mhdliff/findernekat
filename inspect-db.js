import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gfzidlhfplczcatfenfx.supabase.co";
const supabaseAnonKey = "sb_publishable_qGHHx8NSSn7OnP3fV1sMtw_A5SaB850";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectPostsTable() {
  console.log("🔍 Inspecting posts table structure...\n");

  // Ambil 1 row saja untuk lihat struktur
  const { data, error } = await supabase.from("posts").select("*").limit(1);
  
  if (error) {
    console.log("❌ Error:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log("✅ Posts table has data. Column names:");
    console.log(Object.keys(data[0]));
  } else {
    console.log("📭 Posts table is empty, cannot inspect columns.");
    console.log("\nTrying to insert minimal post to see which columns are required...");
    
    // Coba insert dengan hanya kolom wajib
    const { error: insertError } = await supabase.from("posts").insert([{
      id: `p_test_${Date.now()}`,
      userId: "u1",
      type: "lost",
      title: "Test",
      description: "Test",
      category: "Dompet",
      lastSeen: new Date().toISOString(),
    }]);
    
    if (insertError) {
      console.log("❌ Still failed:", insertError.message);
    } else {
      console.log("✅ Insert worked without createdAt!");
    }
  }
}

inspectPostsTable().catch(console.error);
