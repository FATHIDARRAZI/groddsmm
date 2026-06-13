require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function run() {
  const { data: collabRequests, error } = await supabase.from('collab_requests').select('*');
  console.log("Reqs:", collabRequests);
  if (collabRequests && collabRequests.length > 0) {
     const userIds = collabRequests.map(r => r.user_id);
     const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
     console.log("Profiles:", profiles);
     console.log("pErr:", pErr);
  }
}
run();
