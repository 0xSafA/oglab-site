import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function GET() {
  try {
    const ssr = await createServerComponentClient();
    const { data: { user } } = await ssr.auth.getUser();
    if (!user) return NextResponse.json({ ok: true, user: null });
    const supabase = getSupabaseServer();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();
    return NextResponse.json({ ok: true, user: { id: user.id, email: profile?.email || null, role: profile?.role || null } });
  } catch {
    return NextResponse.json({ ok: true, user: null });
  }
}


