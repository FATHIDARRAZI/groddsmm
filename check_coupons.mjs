import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xmwjwnrfdxkhwkbspzed.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtd2p3bnJmZHhraHdrYnNwemVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc4MTM2MCwiZXhwIjoyMDkwMzU3MzYwfQ.caLPrDzS_E0Tj0QVIaXDAwhUuXT74vvtQ9CGd2lB5xw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase.from('coupons').insert({ code: 'TEST1234', points: 1000 }).select('*');
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Inserted:', data);
    // Delete it after
    await supabase.from('coupons').delete().eq('code', 'TEST1234');
  }
}
run();
