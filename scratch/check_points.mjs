import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const email = "fathidarrazi24@gmail.com"; // I'll assume they are the main user
  const { data: users, error } = await supabase.from('profiles').select('id, username, points_balance').order('points_balance', { ascending: false }).limit(5);
  
  const { data: serviceConfig } = await supabase.from('services').select('*').eq('category', 'instagram').eq('service_type', 'followers').single();

  const cost = serviceConfig.provider_cost_per_1000 || 0.10;
  const markup = serviceConfig.markup_multiplier || 3.0;
  const costPerItem = cost * markup;

  console.log(`Service: ${serviceConfig.service_type}. CostPerItem: ${costPerItem}`);

  users.forEach(user => {
    const userPoints = user.points_balance;
    const affordable = Math.floor(userPoints / costPerItem);
    const roundedAffordable = Math.floor(affordable / 10) * 10;
    
    const absoluteMax = serviceConfig.max_quantity || 100000;
    const minQty = serviceConfig.min_quantity || 10;
    
    let result = roundedAffordable < minQty ? minQty : Math.min(roundedAffordable, absoluteMax);
    console.log(`User ${user.username} has ${userPoints} points. Max affordable: ${result}. Rounded affordable: ${roundedAffordable}`);
  });
}
check();
