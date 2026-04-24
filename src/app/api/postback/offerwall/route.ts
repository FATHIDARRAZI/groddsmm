import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseServer';

// Generic Postback Endpoint for Offerwalls (e.g., CPALead, AdGate, Monlix)
// Example URL to configure in the Offerwall Dashboard:
// https://yourdomain.com/api/postback/offerwall?subid={subid}&payout={payout}&status={status}&hash={hash}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract common postback parameters
    // The provider will replace these macros with actual values
    const userId = searchParams.get('subid'); // The user ID we passed to the iframe
    const payoutStr = searchParams.get('payout'); // The amount of points to award
    const status = searchParams.get('status'); // Usually '1' for success, '2' for chargeback
    const hash = searchParams.get('hash'); // Security signature
    
    // Optional: Secret key validation
    // const EXPECTED_SECRET = process.env.OFFERWALL_SECRET;
    // if (EXPECTED_SECRET && hash !== EXPECTED_SECRET) {
    //   return new NextResponse('Invalid Hash', { status: 403 });
    // }

    if (!userId || !payoutStr) {
      return new NextResponse('Missing subid or payout', { status: 400 });
    }

    const points = parseFloat(payoutStr);
    
    if (isNaN(points) || points <= 0) {
      return new NextResponse('Invalid payout amount', { status: 400 });
    }

    // Handle Chargebacks (User reversed the offer or it was fraudulent)
    const isChargeback = status === '2' || status === 'revoked';
    const amountToChange = isChargeback ? -Math.abs(points) : Math.abs(points);

    const adminSupabase = await createSupabaseAdminClient();

    // Fetch current balance
    const { data: profile, error: fetchError } = await adminSupabase
      .from('profiles')
      .select('points_balance')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error(`Postback Error: Profile not found for subid ${userId}`);
      return new NextResponse('User not found', { status: 404 });
    }

    const newBalance = Math.max(0, (profile.points_balance || 0) + amountToChange);

    // Update balance
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ points_balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error(`Postback Error: Failed to update balance for ${userId}`);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Success response required by most offerwalls (usually just '1' or 'OK')
    return new NextResponse('OK', { status: 200 });

  } catch (err: any) {
    console.error('Postback Exception:', err.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
