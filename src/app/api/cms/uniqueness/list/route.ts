import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET(req: Request) {
  const supabase = getSupabaseServer();
  const url = new URL(req.url);
  const postTranslationId = url.searchParams.get('postTranslationId');
  if (!postTranslationId) return NextResponse.json({ ok: false, error: 'missing_postTranslationId' }, { status: 400 });
  const { data, error } = await supabase
    .from('uniqueness_checks')
    .select('id, provider, status, score, created_at, updated_at')
    .eq('post_translation_id', postTranslationId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, checks: data });
}


