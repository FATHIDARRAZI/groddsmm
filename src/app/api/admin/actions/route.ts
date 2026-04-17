import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { action } = await req.json();

    if (action === 'sync_prices') {
      try {
        const params = new URLSearchParams({
          key: SMM_API_KEY,
          action: 'services'
        });
        
        const res = await fetch(SMM_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        
        const services = await res.json();
        
        if (services.error) {
          return NextResponse.json({ error: `Provider Error: ${services.error}` }, { status: 402 });
        }

        // Logical success: we confirmed we can fetch services
        return NextResponse.json({ 
          success: true, 
          message: `تم جلب ${services.length} خدمة بنجاح من المزود`,
          dataCount: services.length 
        });

      } catch (e) {
        return NextResponse.json({ error: 'Failed to contact provider' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin Actions POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
