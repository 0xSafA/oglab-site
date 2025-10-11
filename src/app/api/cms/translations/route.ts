import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');
    if (!postId) return NextResponse.json({ ok: false, error: 'missing_postId' }, { status: 400 });

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('post_translations')
      .select('id, locale, title, slug, seo_title, seo_description, body_md, is_published, published_at, scheduled_at, noindex, preview_token')
      .eq('post_id', postId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, translations: data });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


