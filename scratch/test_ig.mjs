import { ProxyAgent, fetch as undiciFetch } from 'undici';

const proxyUrl = process.env.IG_PROXY_URL;
const sessionid = process.env.IG_SESSION_ID;

async function testIG(useSession) {
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=cristiano`;
  const client = new ProxyAgent(proxyUrl);
  
  const headers = {
    'x-ig-app-id': '936619743392459',
    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.${Math.floor(Math.random()*100)} Safari/537.36`,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
  };

  if (useSession) {
    headers['Cookie'] = `sessionid=${sessionid};`;
  }

  try {
    const res = await undiciFetch(url, { dispatcher: client, headers });
    console.log(`[Use Session: ${useSession}] Status: ${res.status}`);
    if (res.status === 200) {
      const data = await res.json();
      console.log(`Success! Followers: ${data.data?.user?.edge_followed_by?.count}`);
    } else {
      console.log(`Failed. Text: ${await res.text()}`);
    }
  } catch (err) {
    console.log(`Error:`, err.message);
  }
}

async function run() {
  await testIG(false);
  await testIG(true);
}
run();
