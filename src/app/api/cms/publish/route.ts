import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { postId, locale, published_at } = body || {};
    if (!postId || !locale) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    const { error } = await supabase
      .from('post_translations')
      .update({ is_published: true, published_at: published_at || new Date().toISOString() })
      .eq('post_id', postId)
      .eq('locale', locale);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    // Trigger sitemap ping (fire and forget)
    fetch(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/cms/sitemap/ping` : '/api/cms/sitemap/ping', { method: 'POST' }).catch(()=>{});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


