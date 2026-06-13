require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('collab_requests').select('*').eq('user_id', '123e4567-e89b-12d3-a456-426614174000').single();
  console.log("Data:", data);
  console.log("Error:", error);
}

run();
