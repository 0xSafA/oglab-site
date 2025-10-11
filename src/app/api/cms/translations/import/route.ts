import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { postId, translations } = body || {};
    if (!postId || !Array.isArray(translations)) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    const rows = translations.map((t: any) => ({
      post_id: postId,
      locale: t.locale,
      title: t.title || null,
      slug: t.slug || null,
      body_md: t.body_md || null,
      seo_title: t.seo_title || null,
      seo_description: t.seo_description || null,
      is_published: !!t.is_published
    }));
    const { error } = await supabase.from('post_translations').upsert(rows, { onConflict: 'post_id,locale' });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


