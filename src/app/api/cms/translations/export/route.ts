import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(req: Request) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const postId = url.searchParams.get('postId');
  if (!postId) return NextResponse.json({ ok: false, error: 'missing_postId' }, { status: 400 });
  const { data, error } = await supabase
    .from('post_translations')
    .select('*')
    .eq('post_id', postId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return new NextResponse(JSON.stringify({ ok: true, translations: data }, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="post-${postId}-translations.json"` }
  });
}


