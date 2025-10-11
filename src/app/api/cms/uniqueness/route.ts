import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { locale, text, limit = 5, threshold = 0.2 } = body || {};
    if (!locale || !text) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });

    const { data, error } = await supabase.rpc('find_similar_translations', {
      p_locale: locale,
      p_text: text,
      p_limit: limit,
      p_threshold: threshold,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, matches: data });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


