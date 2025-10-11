import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { createServerComponentClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { platform, access_token, refresh_token, expires_at } = body || {};
    if (!platform || !access_token) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    let user_id: string | undefined;
    try {
      const ssr = await createServerComponentClient();
      const { data: { user } } = await ssr.auth.getUser();
      user_id = user?.id;
    } catch {}
    if (!user_id) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    const { data, error } = await supabase
      .from('external_accounts')
      .upsert({ user_id, platform, access_token, refresh_token: refresh_token || null, expires_at: expires_at || null })
      .select('id')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


