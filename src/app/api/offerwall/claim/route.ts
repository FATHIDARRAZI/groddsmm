import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

// ==========================================
// 🛠️ EDIT REWARDS HERE
// ==========================================
const OFFERWALL_REWARDS: Record<string, number> = {
  server_1: 10,
  server_2: 10,
  server_3: 10,
  server_4: 10,
  server_5: 10,
  server_6: 10,
  server_7: 10,
  server_8: 10,
};
// ==========================================

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const adminSupabase = await createSupabaseAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('offerwall_data')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });

    const now = new Date();
    const todayDate = now.toISOString().split('T')[0]; // GMT Date YYYY-MM-DD
    
    let offerwallData = profile.offerwall_data || {};
    
    // Reset if it's a new day
    if (offerwallData.date !== todayDate) {
      offerwallData = { date: todayDate, completed: [] };
    }

    return NextResponse.json({ success: true, completed: offerwallData.completed || [] }, { status: 200 });
  } catch (err: any) {
    console.error('Offerwall API GET Error:', err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { serverId } = await req.json();
    const rewardAmount = OFFERWALL_REWARDS[serverId];
    
    if (!rewardAmount) {
      return NextResponse.json({ error: 'Invalid server or reward not found.' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const adminSupabase = await createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('points_balance, offerwall_data')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });

    const now = new Date();
    const todayDate = now.toISOString().split('T')[0]; // GMT Date YYYY-MM-DD

    let offerwallData = profile.offerwall_data || {};
    
    // Reset if it's a new day
    if (offerwallData.date !== todayDate) {
      offerwallData = { date: todayDate, completed: [] };
    }

    if (offerwallData.completed.includes(serverId)) {
      return NextResponse.json({ error: 'You have already completed this offerwall today. Come back tomorrow!' }, { status: 400 });
    }

    // Add to completed list
    offerwallData.completed.push(serverId);
    const newBalance = profile.points_balance + rewardAmount;

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ 
        points_balance: newBalance,
        offerwall_data: offerwallData 
      })
      .eq('id', user.id);

    if (updateError) {
       return NextResponse.json({ error: 'Database update failed. Ensure offerwall_data column exists.' }, { status: 500 });
    }

    return NextResponse.json({ 
       success: true, 
       pointsAdded: rewardAmount, 
       newBalance 
    }, { status: 200 });

  } catch (err: any) {
    console.error('Offerwall API POST Error:', err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}

