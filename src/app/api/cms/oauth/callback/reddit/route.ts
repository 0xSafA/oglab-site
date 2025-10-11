import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { createServerComponentClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = (await (async () => { return null; })());
  if (!code) return NextResponse.json({ ok: false, error: 'missing_code' }, { status: 400 });

  const clientId = process.env.REDDIT_CLIENT_ID as string;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET as string;
  const redirectUri = process.env.REDDIT_REDIRECT_URI as string;
  const userAgent = process.env.REDDIT_USER_AGENT || 'oglab-site/1.0';
  if (!clientId || !clientSecret || !redirectUri) return NextResponse.json({ ok: false, error: 'missing_reddit_env' }, { status: 500 });

  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'User-Agent': userAgent
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }).toString()
  });
  if (!tokenRes.ok) return NextResponse.json({ ok: false, error: 'token_exchange_failed' }, { status: 500 });
  const tokens = await tokenRes.json();

  // Attach to current user
  let user_id: string | undefined;
  try {
    const ssr = await createServerComponentClient();
    const { data: { user } } = await ssr.auth.getUser();
    user_id = user?.id;
  } catch {}

  const { data, error } = await supabase
    .from('external_accounts')
    .upsert({ user_id: user_id || null, platform: 'reddit', access_token: tokens.access_token, refresh_token: tokens.refresh_token || null, expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null })
    .select('id')
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id });
}


