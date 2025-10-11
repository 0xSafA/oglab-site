import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { createServerComponentClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { post_id, value } = body || {};
    if (!post_id || ![1, -1].includes(value)) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
    // Upsert vote for current user; relies on RLS voter_user_id = auth.uid()
    let voter_user_id: string | undefined;
    try {
      const ssr = await createServerComponentClient();
      const { data: { user } } = await ssr.auth.getUser();
      voter_user_id = user?.id;
    } catch {}
    if (!voter_user_id) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    const { error } = await supabase
      .from('forum_votes')
      .upsert({ post_id, voter_user_id, value })
      .select('post_id')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


