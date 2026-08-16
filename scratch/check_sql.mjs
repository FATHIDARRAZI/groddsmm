import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { error } = await supabase.from('services').select('provider_cost_per_1000').limit(1);
  if (error) {
    console.log("Column missing!", error);
  } else {
    console.log("Column exists!");
  }
}
check();
