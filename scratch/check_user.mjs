import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: users, error } = await supabase.from('profiles').select('id, username, points_balance').order('points_balance', { ascending: false }).limit(3);
  console.log("Users:", users);

  const { data: service } = await supabase.from('services').select('*').eq('category', 'instagram').eq('service_type', 'followers').single();
  console.log("Service:", service);

  for (const user of users) {
    const cost = service.provider_cost_per_1000 || 0.10;
    const markup = service.markup_multiplier || 3.0;
    const costPerItem = cost * markup;
    const affordable = Math.floor(user.points_balance / costPerItem);
    const roundedAffordable = Math.floor(affordable / 10) * 10;
    
    const absoluteMax = service.max_quantity || 100000;
    const minQty = service.min_quantity || 10;
    
    let result = roundedAffordable < minQty ? minQty : Math.min(roundedAffordable, absoluteMax);
    console.log(`User ${user.username} with ${user.points_balance} points can afford: ${result} (roundedAffordable: ${roundedAffordable})`);
  }
}
check();
