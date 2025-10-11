import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { post_id } = body || {};
    if (!post_id) return NextResponse.json({ ok: false, error: 'missing_post_id' }, { status: 400 });
    const { error } = await supabase
      .from('forum_posts')
      .update({ is_approved: true })
      .eq('id', post_id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


