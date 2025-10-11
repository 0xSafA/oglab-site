import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { postId, locale, title, slug, excerpt, body_md, seo_title, seo_description, og_image_url, is_published } = body || {};
    if (!postId || !locale || !title || !slug) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('post_translations')
      .upsert({
        post_id: postId,
        locale,
        title,
        slug,
        excerpt: excerpt || null,
        body_md: body_md || null,
        seo_title: seo_title || null,
        seo_description: seo_description || null,
        og_image_url: og_image_url || null,
        is_published: !!is_published
      }, { onConflict: 'post_id,locale' })
      .select('id')
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


