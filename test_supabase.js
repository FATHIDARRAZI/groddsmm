const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('collab_requests').select('*').eq('user_id', '00000000-0000-0000-0000-000000000000').single();
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
