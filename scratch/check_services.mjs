import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('services').select('*');
  console.log("Services:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
check();
