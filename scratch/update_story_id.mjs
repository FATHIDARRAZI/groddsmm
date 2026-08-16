import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Update the ID for story views
  const { error: updateError } = await supabase.from('services')
    .update({ provider_service_id: '1256' })
    .eq('category', 'instagram')
    .eq('service_type', 'story_views');
    
  if (updateError) console.error("Update Error:", updateError);

  // 2. Fetch the min quantities for all IG services
  const { data, error } = await supabase.from('services')
    .select('service_type, min_quantity')
    .eq('category', 'instagram');
    
  if (error) {
    console.error("Fetch Error:", error);
  } else {
    console.log("Minimum Orders:");
    data.forEach(s => {
      console.log(`- ${s.service_type}: ${s.min_quantity}`);
    });
  }
}
run();
