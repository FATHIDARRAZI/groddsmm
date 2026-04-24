import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

const TASK_POINTS: Record<number, number> = {
  0: 3, 1: 3, 2: 3, 3: 3,
  4: 5,
  5: 1, 6: 1, 7: 1, 8: 1,
  9: 2, 10: 2, 11: 2, 12: 2
};

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    if (taskId === undefined || !TASK_POINTS.hasOwnProperty(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const pointsToAward = TASK_POINTS[taskId];

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = await createSupabaseAdminClient();

    // Fetch current balance
    const { data: profile, error: fetchError } = await adminSupabase
      .from('profiles')
      .select('points_balance')
      .eq('id', user.id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const newBalance = (profile.points_balance || 0) + pointsToAward;

    // Update balance
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ points_balance: newBalance })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    return NextResponse.json({ success: true, newBalance, pointsAwarded: pointsToAward });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
