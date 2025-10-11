import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(req: Request) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const threadId = url.searchParams.get('threadId');
  if (!threadId) return NextResponse.json({ ok: false, error: 'missing_threadId' }, { status: 400 });

  const { data, error } = await supabase
    .from('forum_posts')
    .select('id, forum_votes(value)')
    .eq('thread_id', threadId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const scores = (data || []).map((row: any) => ({ post_id: row.id, score: Array.isArray(row.forum_votes) ? row.forum_votes.reduce((s: number, v: any) => s + (v?.value || 0), 0) : 0 }));
  return NextResponse.json({ ok: true, scores });
}


