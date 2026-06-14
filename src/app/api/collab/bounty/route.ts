import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bountyId, proofUrl } = await req.json();

    if (!bountyId || !proofUrl) {
      return NextResponse.json({ error: 'Missing bounty details' }, { status: 400 });
    }

    // Verify user actually has an accepted collab request
    const { data: collabRequest } = await supabase
      .from('collab_requests')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (!collabRequest || collabRequest.status !== 'accepted') {
      return NextResponse.json({ error: 'Only accepted partners can submit bounties' }, { status: 403 });
    }

    // Check if user already has a pending or approved submission for this bounty
    const { data: existing } = await supabase
      .from('bounty_submissions')
      .select('status')
      .eq('user_id', user.id)
      .eq('bounty_id', bountyId)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `You already have a ${existing.status} submission for this bounty.` }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('bounty_submissions')
      .insert({
        user_id: user.id,
        bounty_id: bountyId,
        proof_url: proofUrl,
        status: 'pending'
      });

    if (insertError) {
      console.error('Bounty insert error:', insertError);
      return NextResponse.json({ error: 'Failed to submit bounty' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Bounty submitted successfully!' });

  } catch (error: any) {
    console.error('Bounty Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('bounty_submissions')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch bounties' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
