import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { createServerComponentClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const threadId = url.searchParams.get('threadId');
  if (!threadId) return NextResponse.json({ ok: false, error: 'missing_threadId' }, { status: 400 });
  const { data, error } = await supabase
    .from('forum_posts')
    .select('id, author_user_id, body_md, created_at, is_approved, is_shadowed')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, posts: data });
}

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { thread_id, body_md } = body || {};
    if (!thread_id || !body_md) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });

    // Identify user for authoring and rate limit
    let author_user_id: string | undefined;
    try {
      const ssr = await createServerComponentClient();
      const { data: { user } } = await ssr.auth.getUser();
      author_user_id = user?.id;
    } catch {}
    if (!author_user_id) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    // Simple rate limit: at most 1 post per 15s per user
    const { data: last } = await supabase
      .from('forum_posts')
      .select('created_at')
      .eq('author_user_id', author_user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (last?.created_at) {
      const diff = Date.now() - new Date(last.created_at).getTime();
      if (diff < 15000) {
        return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
      }
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({ thread_id, body_md, author_user_id })
      .select('id')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { post_id } = body || {};
    if (!post_id) return NextResponse.json({ ok: false, error: 'missing_post_id' }, { status: 400 });
    const { error } = await supabase.from('forum_posts').delete().eq('id', post_id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


