require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await adminSupabase
    .from('tickets')
    .select('*, profiles(full_name, username)')
    .order('updated_at', { ascending: false });

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

test();
