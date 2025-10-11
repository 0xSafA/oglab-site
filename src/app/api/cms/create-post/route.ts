import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { createServerComponentClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    let { author_id, short_answer, tldr, sources, geo_tags } = body || {};
    try {
      const ssr = await createServerComponentClient();
      const { data: { user } } = await ssr.auth.getUser();
      if (user?.id && !author_id) author_id = user.id;
    } catch {}
    const { data, error } = await supabase
      .from('posts')
      .insert({ author_id: author_id || null, short_answer: short_answer || null, tldr: tldr || null, sources: sources || null, geo_tags: geo_tags || null })
      .select('id')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


