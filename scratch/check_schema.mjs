import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('services').select('provider_cost_per_1000').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}
check();
