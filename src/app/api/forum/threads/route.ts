import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { createServerComponentClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  let query = supabase
    .from('forum_threads')
    .select('id, title, best_post_id, created_at');
  if (q) {
    query = query.ilike('title', `%${q}%`);
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, threads: data || [] });
}

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { title } = body || {};
    if (!title) return NextResponse.json({ ok: false, error: 'missing_title' }, { status: 400 });
    let author_user_id: string | undefined;
    try {
      const ssr = await createServerComponentClient();
      const { data: { user } } = await ssr.auth.getUser();
      author_user_id = user?.id;
    } catch {}
    const { data, error } = await supabase
      .from('forum_threads')
      .insert({ title, author_user_id: author_user_id || null })
      .select('id')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


