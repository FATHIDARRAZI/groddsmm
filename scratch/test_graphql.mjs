import { ProxyAgent, fetch as undiciFetch } from 'undici';

const proxyUrl = process.env.IG_PROXY_URL;
const sessionid = process.env.IG_SESSION_ID;

async function run() {
  const userId = '173560420'; // cristiano
  const client = new ProxyAgent(proxyUrl);
  
  const sUrl = `https://www.instagram.com/graphql/query/?query_hash=69cba40317214236af40e7efa697781d&variables=%7B%22id%22%3A%22${userId}%22%2C%22first%22%3A12%7D`;
  const headers = {
    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.${Math.floor(Math.random()*100)} Safari/537.36`,
    'Cookie': `sessionid=${sessionid};`,
    'x-ig-app-id': '936619743392459',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
  };
  
  const res = await undiciFetch(sUrl, { dispatcher: client, headers });
  console.log("Status:", res.status);
  if (res.status === 200) {
    const data = await res.json();
    const edges = data.data?.user?.edge_owner_to_timeline_media?.edges;
    console.log("Feed items:", edges?.length);
    if (edges?.length > 0) {
      console.log("First item:", edges[0].node.shortcode);
    }
  } else {
    console.log("Failed:", await res.text());
  }
}
run();
