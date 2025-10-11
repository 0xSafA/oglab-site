import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { postId, locale } = body || {};
    if (!postId || !locale) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    const token = generateToken();
    const { error } = await supabase
      .from('post_translations')
      .update({ preview_token: token })
      .eq('post_id', postId)
      .eq('locale', locale);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, token });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


