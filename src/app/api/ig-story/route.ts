import { NextResponse } from 'next/server';
import { ProxyAgent, fetch as undiciFetch } from 'undici';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const proxyUrl = process.env.IG_PROXY_URL || '';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. You must be logged in.' }, { status: 401 });
    }

    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.replace('@', '').trim();
    if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
      return NextResponse.json({ success: false, error: 'Invalid username format' }, { status: 400 });
    }
    const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    
    // Fire parallel requests to bypass rate limits using proxy
    const fetchPromises = Array.from({ length: 3 }).map(async () => {
      const client = new ProxyAgent(proxyUrl);
      const res = await undiciFetch(url, {
        dispatcher: client,
        headers: {
          'x-ig-app-id': '936619743392459',
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.${Math.floor(Math.random()*100)} Safari/537.36`,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      });
      if (res.status === 200) {
        return await res.json();
      }
      throw new Error(`Status ${res.status}`);
    });

    let data;
    try {
      data = await Promise.any(fetchPromises);
    } catch (aggregateError) {
      console.error('All IG Profile fetches failed:', aggregateError);
      return NextResponse.json({ success: false, error: 'لم يتم العثور على الحساب.' });
    }

    const typedData = data as any;
    if (typedData?.data?.user) {
      const user = typedData.data.user;
      
      // If private, return immediately
      if (user.is_private === true) {
         return NextResponse.json({
            success: true,
            data: {
              username: user.username,
              is_private: true,
              stories: []
            }
         });
      }

      const rawProfilePic = user.profile_pic_url_hd || user.profile_pic_url || '';
      const proxiedProfilePic = rawProfilePic 
        ? `/api/proxy-image?url=${encodeURIComponent(rawProfilePic)}` 
        : '';

      const sessionId = process.env.IG_SESSION_ID || '';
      let realStories: any[] = [];
      
      try {
        const client = new ProxyAgent(proxyUrl);
        const storyRes = await undiciFetch(`https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${user.id}`, {
          dispatcher: client,
          headers: {
            'User-Agent': 'Instagram 219.0.0.12.117 Android',
            'Cookie': `sessionid=${sessionId}`,
            'x-ig-app-id': '936619743392459',
            'Accept': '*/*',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
          }
        });
        
        if (storyRes.status === 200) {
          const storyData: any = await storyRes.json();
          const reel = storyData?.reels?.[user.id];
          
          if (reel && reel.items) {
             realStories = reel.items.map((item: any) => {
               const isVideo = item.media_type === 2; // 1 = image, 2 = video
               
               let mediaUrl = '';
               let thumbnailUrl = '';
               
               if (isVideo) {
                 mediaUrl = item.video_versions?.[0]?.url || '';
                 thumbnailUrl = item.image_versions2?.candidates?.[0]?.url || '';
               } else {
                 mediaUrl = item.image_versions2?.candidates?.[0]?.url || '';
                 thumbnailUrl = mediaUrl; // For images, thumbnail is same
               }
               
               return {
                 id: item.pk,
                 type: isVideo ? 'video' : 'image',
                 // Use direct URLs for video so it streams fast, images can be proxied
                 media_url: isVideo ? mediaUrl : (mediaUrl ? `/api/proxy-image?url=${encodeURIComponent(mediaUrl)}` : ''),
                 download_url: mediaUrl ? `/api/proxy-image?url=${encodeURIComponent(mediaUrl)}` : '',
                 thumbnail_url: thumbnailUrl ? `/api/proxy-image?url=${encodeURIComponent(thumbnailUrl)}` : '',
                 taken_at: item.taken_at
               };
             });
          }
        } else {
          console.error(`Story API returned status: ${storyRes.status}`);
        }
      } catch (err) {
        console.error('Failed to fetch real stories:', err);
      }

      return NextResponse.json({
        success: true,
        data: {
          username: user.username,
          full_name: user.full_name,
          profile_pic: proxiedProfilePic,
          followers: user.edge_followed_by?.count || 0,
          is_private: false,
          stories: realStories
        }
      });
    }

    return NextResponse.json({ success: false, error: 'لم يتم العثور على الحساب.' });
  } catch (error) {
    console.error('IG Story API Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب بيانات القصص' }, { status: 500 });
  }
}
