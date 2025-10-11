import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(req: Request) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const postTranslationId = url.searchParams.get('postTranslationId');
  const { data, error } = await supabase
    .from('post_shares')
    .select('*')
    .eq('post_translation_id', postTranslationId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, shares: data });
}

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { post_translation_id, platform, content_md, scheduled_at, utm_source, utm_campaign } = body || {};
    if (!post_translation_id || !platform) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    const { data, error } = await supabase
      .from('post_shares')
      .upsert({ post_translation_id, platform, content_md, scheduled_at, utm_source, utm_campaign })
      .select('id')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


