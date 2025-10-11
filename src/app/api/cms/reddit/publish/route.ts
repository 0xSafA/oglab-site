import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { redditSubmit, redditRefreshToken } from '@/lib/reddit';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { post_translation_id, subreddit, title, content_md, url } = body || {};
    if (!post_translation_id || !subreddit || !title) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });

    // Get reddit token from external_accounts
    const { data: acct } = await supabase
      .from('external_accounts')
      .select('access_token')
      .eq('platform', 'reddit')
      .limit(1)
      .single();
    const accessToken = acct?.access_token as string;
    if (!accessToken) return NextResponse.json({ ok: false, error: 'missing_reddit_token' }, { status: 400 });

    let res;
    try {
      res = await redditSubmit({ accessToken, subreddit, title, text: content_md, url });
    } catch (e) {
      // Attempt refresh and retry
      const { data: acct2 } = await supabase
        .from('external_accounts')
        .select('refresh_token')
        .eq('platform', 'reddit')
        .limit(1)
        .single();
      const refreshToken = acct2?.refresh_token as string | undefined;
      if (!refreshToken) return NextResponse.json({ ok: false, error: 'reddit_submit_failed' }, { status: 500 });
      const tokens = await redditRefreshToken(process.env.REDDIT_CLIENT_ID as string, process.env.REDDIT_CLIENT_SECRET as string, refreshToken);
      await supabase
        .from('external_accounts')
        .update({ access_token: tokens.access_token, refresh_token: tokens.refresh_token || refreshToken, expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null })
        .eq('platform', 'reddit');
      res = await redditSubmit({ accessToken: tokens.access_token, subreddit, title, text: content_md, url });
    }

    // Update share status
    await supabase
      .from('post_shares')
      .update({ status: 'published', external_post_id: res?.json?.data?.id || res?.name, external_url: res?.json?.data?.url || res?.url })
      .eq('post_translation_id', post_translation_id)
      .eq('platform', 'reddit');

    return NextResponse.json({ ok: true, result: res });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'publish_failed' }, { status: 500 });
  }
}


