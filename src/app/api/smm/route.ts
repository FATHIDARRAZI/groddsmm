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
    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const ip = rawIp.split(',')[0].trim();

    // Check Global 2-Minute Cooldown across all requests from this IP FIRST
    const cooldownEnd = await getCooldownEnd(ip);
    if (cooldownEnd) {
      return NextResponse.json(
        { error: 'User is on cooldown', cooldownEnd },
        { status: 429 }
      );
    }

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
    const { link, serviceType, recaptchaToken, quantity: requestedQuantity } = body;

    if (!link || !serviceType || !recaptchaToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify Google reCAPTCHA Token
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || '';
    const formData = new URLSearchParams();
    formData.append('secret', recaptchaSecret);
    formData.append('response', recaptchaToken);

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: formData,
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json({ error: 'التحقق البشري غير صالح' }, { status: 403 });
    }

    // Determine target quantity (use requested, or fallback to safe minimum 100)
    let finalQuantity = typeof requestedQuantity === 'number' && requestedQuantity >= 100 ? requestedQuantity : 100;

    let serviceId = '';

    if (serviceType === 'views') {
      serviceId = '2020';
      // If no valid dynamic quantity was passed, default to minimum 100 views
      if (!requestedQuantity || requestedQuantity < 100) finalQuantity = 100;
      
    } else if (serviceType === 'likes') {
      serviceId = '917';
      // If no valid dynamic quantity was passed, default to minimum 100 likes
      if (!requestedQuantity || requestedQuantity < 100) finalQuantity = 100;
      
    } else {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
    }

    const smmLink = link.includes('http') ? link : `https://${link}`;

    const params = new URLSearchParams({
      key: SMM_API_KEY,
      action: 'add',
      service: serviceId,
      link: smmLink,
      quantity: finalQuantity.toString()
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
      // Start 2 min cooldown for this IP
      await setCooldown(ip, 2);
      return NextResponse.json({ success: true, message: 'Request submitted successfully' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Unexpected response from provider' }, { status: 500 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
