import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { thread_id, post_id } = body || {};
    if (!thread_id || !post_id) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    const { error } = await supabase.rpc('set_best_answer', { p_thread_id: thread_id, p_post_id: post_id });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


