export async function redditSubmit(params: { accessToken: string; subreddit: string; title: string; text?: string; url?: string }) {
  const { accessToken, subreddit, title, text, url } = params;
  const body = new URLSearchParams();
  body.set('sr', subreddit);
  body.set('title', title);
  body.set('kind', text ? 'self' : 'link');
  if (text) body.set('text', text);
  if (url) body.set('url', url);
  const res = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USER_AGENT || 'oglab-site/1.0'
    },
    body: body.toString()
  });
  if (!res.ok) throw new Error('Reddit submit failed');
  return await res.json();
}

export async function redditRefreshToken(clientId: string, clientSecret: string, refreshToken: string) {
  const body = new URLSearchParams();
  body.set('grant_type', 'refresh_token');
  body.set('refresh_token', refreshToken);
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USER_AGENT || 'oglab-site/1.0'
    },
    body: body.toString()
  });
  if (!res.ok) throw new Error('Reddit refresh failed');
  return await res.json();
}


