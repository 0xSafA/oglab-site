import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { short_answer, body_md } = body || {};
    const issues: string[] = [];
    if (!short_answer || short_answer.split('.').join('').length < 10) issues.push('Short answer is too short');
    if (!/\n\n- |\n\n\d+\. /.test(body_md || '')) issues.push('Body should include a list (bulleted or numbered)');
    return NextResponse.json({ ok: issues.length === 0, issues });
  } catch {
    return NextResponse.json({ ok: false, issues: ['bad_request'] }, { status: 400 });
  }
}


