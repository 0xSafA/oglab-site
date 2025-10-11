import { NextResponse } from 'next/server';

function randomState() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function GET() {
  const clientId = process.env.REDDIT_CLIENT_ID as string;
  const redirectUri = process.env.REDDIT_REDIRECT_URI as string;
  const scope = process.env.REDDIT_SCOPE || 'identity submit';
  if (!clientId || !redirectUri) {
    return NextResponse.json({ ok: false, error: 'missing_reddit_env' }, { status: 500 });
  }
  const state = randomState();
  const url = new URL('https://www.reddit.com/api/v1/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('duration', 'permanent');
  url.searchParams.set('scope', scope);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set('reddit_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  return res;
}


