import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';
import { copyleaksLogin, submitTextScan } from '@/lib/copyleaks';

// Stub for external uniqueness providers (Copyleaks/Originality.ai)
// Accepts provider, text, and returns accepted for async processing
export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  try {
    const body = await req.json();
    const { provider, post_translation_id, text } = body || {};
    if (!provider || !post_translation_id || !text) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    // queue record
    const { data, error } = await supabase
      .from('uniqueness_checks')
      .insert({ provider, post_translation_id, status: 'queued' })
      .select('id')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    // Copyleaks submit
    if (provider === 'copyleaks') {
      const email = process.env.COPYLEAKS_EMAIL as string;
      const apiKey = process.env.COPYLEAKS_API_KEY as string;
      if (!email || !apiKey) return NextResponse.json({ ok: false, error: 'missing_copyleaks_keys' }, { status: 500 });
      const token = await copyleaksLogin(email, apiKey);
      const webhookUrl = (process.env.NEXT_PUBLIC_BASE_URL || '') + '/api/cms/uniqueness/webhook';
      await submitTextScan({ token, text, sandbox: false, submitId: data!.id, webhookUrl });
    }
    return NextResponse.json({ ok: true, accepted: true, id: data?.id, provider }, { status: 202 });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


