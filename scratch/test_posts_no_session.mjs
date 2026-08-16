import { ProxyAgent, fetch as undiciFetch } from 'undici';

const proxyUrl = process.env.IG_PROXY_URL;

async function run() {
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=cristiano`;
  const client = new ProxyAgent(proxyUrl);
  
  const headers = {
    'x-ig-app-id': '936619743392459',
    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.${Math.floor(Math.random()*100)} Safari/537.36`,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
  };

  const res = await undiciFetch(url, { dispatcher: client, headers });
  console.log("Status:", res.status);
  if (res.status === 200) {
    const data = await res.json();
    const user = data.data.user;
    console.log("Followers:", user.edge_followed_by?.count);
    const edges = user.edge_owner_to_timeline_media?.edges || [];
    console.log(`Found ${edges.length} posts`);
  } else {
    console.log("Failed:", res.status);
  }
}
run();
