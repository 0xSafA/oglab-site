import { NextResponse } from 'next/server';
import { listJobs } from '@/lib/job-queue';

export async function GET() {
  return NextResponse.json({ ok: true, jobs: listJobs() });
}


