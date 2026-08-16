import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fetchServices() {
  const { data, error } = await supabase.from('services').select('id, category, service_type, provider_service_id');
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("Services List:");
  data.forEach(s => {
    console.log(`- ${s.category.toUpperCase()} ${s.service_type.toUpperCase()} | Supabase ID: ${s.id} | Provider ID: ${s.provider_service_id}`);
  });
}

fetchServices();
