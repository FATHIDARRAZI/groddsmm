import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Delete non-IG services
  console.log("Deleting non-IG services...");
  const { error: delError } = await supabase.from('services').delete().neq('category', 'instagram');
  if (delError) console.error("Delete Error:", delError);

  // 2. Update existing IG services
  const updates = [
    { service_type: 'followers', cost: 0.4841 },
    { service_type: 'likes', cost: 0.1529 },
    { service_type: 'views', cost: 0.0078 } // (reels views)
  ];

  for (const up of updates) {
    console.log(`Updating ${up.service_type}...`);
    const { error } = await supabase.from('services')
      .update({ provider_cost_per_1000: up.cost, markup_multiplier: 3.0 })
      .eq('category', 'instagram')
      .eq('service_type', up.service_type);
    if (error) console.error(`Error updating ${up.service_type}:`, error);
  }

  // 3. Add Story Views if it doesn't exist
  const { data: storyData } = await supabase.from('services')
    .select('id')
    .eq('category', 'instagram')
    .eq('service_type', 'story_views')
    .single();

  if (!storyData) {
    console.log("Inserting story_views...");
    const { error: insertError } = await supabase.from('services').insert({
      category: 'instagram',
      service_type: 'story_views',
      provider_service_id: '0', // Placeholder
      min_quantity: 100,
      max_quantity: 100000,
      is_active: true,
      provider_cost_per_1000: 0.099,
      markup_multiplier: 3.0
    });
    if (insertError) console.error("Insert Error:", insertError);
  } else {
    console.log("Updating story_views...");
    const { error: updateError } = await supabase.from('services')
      .update({ provider_cost_per_1000: 0.099, markup_multiplier: 3.0 })
      .eq('id', storyData.id);
    if (updateError) console.error("Update Error:", updateError);
  }
  
  console.log("Done!");
}
run();
