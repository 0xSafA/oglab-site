import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

// Provider webhook to update status/score
export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { id, external_id, status, score, details } = body || {};
    if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
    const { error } = await supabase
      .from('uniqueness_checks')
      .update({ external_id: external_id || null, status: status || 'completed', score: score || null, details: details || null })
      .eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


