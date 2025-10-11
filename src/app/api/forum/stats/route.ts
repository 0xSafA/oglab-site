import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('forum_daily_stats', { p_days: 30 });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, stats: data });
}


