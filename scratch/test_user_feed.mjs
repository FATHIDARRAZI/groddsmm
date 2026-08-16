import { ProxyAgent, fetch as undiciFetch } from 'undici';

const proxyUrl = process.env.IG_PROXY_URL;
const sessionid = process.env.IG_SESSION_ID;

async function run() {
  const userId = '173560420'; // cristiano
  const client = new ProxyAgent(proxyUrl);
  
  const sUrl = `https://i.instagram.com/api/v1/feed/user/${userId}/`;
  const headers = {
    'User-Agent': 'Instagram 219.0.0.12.117 Android',
    'Cookie': `sessionid=${sessionid}; ds_user_id=66432267860;`,
    'x-ig-app-id': '936619743392459'
  };
  
  const res = await undiciFetch(sUrl, { dispatcher: client, headers });
  console.log("Status:", res.status);
  if (res.status === 200) {
    const data = await res.json();
    console.log("Feed items:", data.items?.length);
    if (data.items?.length > 0) {
      const item = data.items[0];
      console.log("Item keys:", Object.keys(item));
      console.log("Code:", item.code); // shortcode
      console.log("Video:", item.media_type === 2);
      console.log("Likes:", item.like_count);
      console.log("Comments:", item.comment_count);
      console.log("Views:", item.view_count);
    }
  } else {
    console.log("Failed:", await res.text());
  }
}
run();
