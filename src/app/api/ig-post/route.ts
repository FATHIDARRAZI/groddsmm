import { NextResponse } from 'next/server';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

const proxyUrl = 'http://rpW0KdeSoIywvifr:VkSkxqGz0xJb1om8@geo.iproyal.com:12321';

function extractShortcode(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('instagram.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && (parts[0] === 'p' || parts[0] === 'reel' || parts[0] === 'tv')) {
      return parts[1];
    }
  } catch(e) {
    return null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { link } = await request.json();

    if (!link) {
      return NextResponse.json({ success: false, error: 'Link is required' }, { status: 400 });
    }

    const shortcode = extractShortcode(link);
    if (!shortcode) {
      return NextResponse.json({ success: false, error: 'رابط انستقرام غير صحيح' }, { status: 400 });
    }
    
    const client = new ProxyAgent(proxyUrl);
    
    // We use the embed endpoint because it's public and doesn't require auth to see thumbnail/likes
    const url = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    
    const res = await undiciFetch(url, {
      dispatcher: client,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (res.status !== 200) {
      console.error('IG Post Fetch failed with status:', res.status);
      return NextResponse.json({ success: false, error: 'لم يتم العثور على المنشور أو الحساب خاص.' });
    }

    const html = await res.text();
    
    // Extract thumbnail
    const imgMatch = html.match(/<img class="EmbeddedMediaImage"[^>]+src="([^"]+)"/);
    let thumbnail = '';
    if (imgMatch) {
       thumbnail = imgMatch[1].replace(/&amp;/g, '&');
       thumbnail = `/api/proxy-image?url=${encodeURIComponent(thumbnail)}`;
    }

    // Extract likes
    let likes = 0;
    const spanMatch = html.match(/>([\d,MKB\.]+)\s+likes</i);
    if (spanMatch) {
       let likesStr = spanMatch[1].replace(/,/g, '');
       if (likesStr.toLowerCase().includes('m')) likes = parseFloat(likesStr) * 1000000;
       else if (likesStr.toLowerCase().includes('k')) likes = parseFloat(likesStr) * 1000;
       else likes = parseInt(likesStr);
    }
    
    if (Number.isNaN(likes)) likes = 0;

    return NextResponse.json({
      success: true,
      data: {
        shortcode,
        thumbnail,
        likes,
        views: 0,
        isVideo: html.includes('video')
      }
    });

  } catch (error) {
    console.error('IG API Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب المنشور' }, { status: 500 });
  }
}
