import { NextResponse } from 'next/server';
import { enqueue } from '@/lib/job-queue';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    enqueue('compliance', body);
    return NextResponse.json({ ok: true, action: 'compliance', accepted: true }, { status: 202 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}


