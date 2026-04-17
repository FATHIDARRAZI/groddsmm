import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { points } = await req.json();

    // 1. Anti-Tampering Mechanism (Block Hacker API Injections)
    const validPointValues = [50, 100, 250, 500];
    if (!validPointValues.includes(points)) {
      return NextResponse.json(
        { error: 'Invalid point payout requested. Tampering detected.' },
        { status: 403 } // Forbidden
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Authentication Block
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Initialize Admin Client to bypass RLS for the deposit
    const adminSupabase = await createSupabaseAdminClient();

    // 3. Fetch specific user profile to grab current balance
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('points_balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
       // Profile doesn't exist natively. Create it and seed initial spin points.
       const { error: insertError } = await adminSupabase
         .from('profiles')
         .insert({ id: user.id, points_balance: points });
         
       if (insertError) {
         return NextResponse.json({ error: 'Database insert failed.' }, { status: 500 });
       }
       
       return NextResponse.json({ success: true, pointsAdded: points, newBalance: points }, { status: 200 });
    }

    // 4. Mathematics & Server-Side Deposit
    const newBalance = profile.points_balance + points;

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ points_balance: newBalance })
      .eq('id', user.id);

    if (updateError) {
       return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
    }

    // Success response
    return NextResponse.json({ 
       success: true, 
       pointsAdded: points, 
       newBalance 
    }, { status: 200 });

  } catch (err: any) {
    console.error('Points API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
