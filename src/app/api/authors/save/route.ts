import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { user_id, display_name, bio, credentials, photo_url, links } = body || {};
    if (!user_id) return NextResponse.json({ ok: false, error: 'missing_user_id' }, { status: 400 });
    const { error } = await supabase
      .from('author_profiles')
      .upsert({ user_id, display_name, bio, credentials, photo_url, links })
      .select('user_id')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


