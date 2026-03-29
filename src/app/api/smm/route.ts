import { NextResponse } from 'next/server';
import { getCooldownEnd, setCooldown } from '@/lib/cooldown';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export async function POST(req: Request) {
  try {
    // Basic IP rate limiting (simplified for MVP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const rt = rateLimitMap.get(ip);
    
    if (rt && now - rt.timestamp < RATE_LIMIT_WINDOW) {
      if (rt.count >= MAX_REQUESTS) {
        return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
      }
      rt.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }

    const body = await req.json();
    const { link, serviceType } = body;

    if (!link || !serviceType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check Cooldown
    const cooldownEnd = await getCooldownEnd(link);
    if (cooldownEnd) {
      return NextResponse.json(
        { error: 'User is on cooldown', cooldownEnd },
        { status: 429 }
      );
    }

    let serviceId = '';
    let quantity = 0;

    if (serviceType === 'views') {
      serviceId = '2020';
      quantity = 10;
    } else if (serviceType === 'likes') {
      serviceId = '584';
      quantity = 100;
    } else {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
    }

    const smmLink = link.includes('http') ? link : `https://${link}`;

    const params = new URLSearchParams({
      key: SMM_API_KEY,
      action: 'add',
      service: serviceId,
      link: smmLink,
      quantity: quantity.toString()
    });

    const smmRes = await fetch(SMM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const smmData = await smmRes.json();

    if (smmData.error) {
      console.error('SMM Panel Error:', smmData.error);
      return NextResponse.json({ error: 'تعذر إرسال الطلب في الوقت الحالي' }, { status: 500 });
    }

    if (smmData.order) {
      // Start 2 min cooldown
      await setCooldown(link, 2);
      return NextResponse.json({ success: true, message: 'Request submitted successfully' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Unexpected response from provider' }, { status: 500 });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
