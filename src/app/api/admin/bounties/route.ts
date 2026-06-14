import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Admin Client
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function createSupabaseAdminClient() {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const adminClient = createSupabaseAdminClient();
    
    // Fetch all bounties
    const { data: bounties, error } = await adminClient
      .from('bounty_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch bounties error:', error);
      return NextResponse.json({ error: 'Failed to fetch bounties' }, { status: 500 });
    }

    if (!bounties || bounties.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const userIds = [...new Set(bounties.map((b: any) => b.user_id))];

    // Fetch user details
    const { data: profilesData } = await adminClient
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    const bountiesWithProfiles = bounties.map((b: any) => {
      const userProfile = profilesData?.find((p: any) => p.id === b.user_id);
      return {
        ...b,
        user_name: userProfile?.full_name || 'مستخدم غير معروف',
        user_email: userProfile?.email || 'لا يوجد بريد',
      };
    });

    return NextResponse.json({ success: true, data: bountiesWithProfiles });

  } catch (error: any) {
    console.error('Admin Bounties Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { submissionId, status, note, rewardPoints, userId } = await req.json();

    if (!submissionId || !status || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // 1. Update the submission status
    const { error: updateError } = await adminClient
      .from('bounty_submissions')
      .update({
        status,
        admin_note: note || null,
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission:', updateError);
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
    }

    // 2. If approved and rewardPoints > 0, give points to user
    if (status === 'approved' && rewardPoints > 0) {
      // Use RPC if available
      const { error: rpcError } = await adminClient.rpc('add_points', {
        user_id: userId,
        amount: rewardPoints
      });

      // Fallback if RPC doesn't exist
      if (rpcError) {
         console.warn('RPC add_points failed, attempting direct profile update', rpcError);
         const { data: currentProfile } = await adminClient
           .from('profiles')
           .select('points_balance')
           .eq('id', userId)
           .single();
           
         if (currentProfile) {
            await adminClient
              .from('profiles')
              .update({ points_balance: currentProfile.points_balance + rewardPoints })
              .eq('id', userId);
         }
      }
    }

    return NextResponse.json({ success: true, message: 'Bounty updated successfully' });

  } catch (error: any) {
    console.error('Admin Bounty Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
