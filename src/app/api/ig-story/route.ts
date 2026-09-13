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

    const scrapeToken = process.env.SCRAPE_DO_TOKEN || '';
    if (!scrapeToken) {
      return NextResponse.json({ success: false, error: 'api_limit_reached' });
    }

    const targetUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    const url = `http://api.scrape.do?token=${scrapeToken}&url=${encodeURIComponent(targetUrl)}`;
    
    let data: any;
    let fetchError = '';
    
    try {
      const headers: Record<string, string> = {
        'x-ig-app-id': '936619743392459',
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.${Math.floor(Math.random()*100)} Safari/537.36`,
      };

      const res = await undiciFetch(url, { headers });

      if (res.status === 200) {
        data = await res.json();
      } else {
        fetchError = `Status ${res.status}`;
      }
    } catch (err: any) {
      fetchError = err.message;
    }

    if (!data || !data.data || !data.data.user) {
      console.error('IG Story scrape.do failed:', fetchError);
      return NextResponse.json({ success: false, error: 'api_limit_reached' });
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
        const targetStoryUrl = `https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${user.id}`;
        const storyUrl = `http://api.scrape.do?token=${scrapeToken}&url=${encodeURIComponent(targetStoryUrl)}`;
        
        const storyRes = await undiciFetch(storyUrl, {
          headers: {
            'User-Agent': 'Instagram 219.0.0.12.117 Android',
            'Cookie': `sessionid=${sessionId}`,
            'x-ig-app-id': '936619743392459'
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

      if (realStories.length === 0) {
        return NextResponse.json({ success: false, error: 'api_limit_reached' });
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
  } catch (error: any) {
    console.error('IG Story API Error:', error);
    return NextResponse.json({ success: false, error: `حدث خطأ أثناء جلب بيانات القصص: ${error.message}` }, { status: 500 });
  }
}
