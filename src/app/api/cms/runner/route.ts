import { NextResponse } from 'next/server';
import { nextJob, updateJob } from '@/lib/job-queue';
import { runTransform } from '@/lib/cms-ai';
import { getSupabaseServer } from '@/lib/supabase-client';

export async function POST() {
  const job = nextJob();
  if (!job) return NextResponse.json({ ok: true, message: 'no_jobs' });

  updateJob(job.id, { status: 'running' });
  try {
    if (job.kind === 'translate' || job.kind === 'improve' || job.kind === 'compliance') {
      const payload = job.payload as any;
      const supabase = getSupabaseServer();
      const result = await runTransform(payload);
      // Persist minimal outcome if postId present
      if (payload.postId) {
        if (job.kind === 'translate' && result.byLocale && Array.isArray(payload.targetLocales)) {
          for (const lc of payload.targetLocales as string[]) {
            const content = result.byLocale?.[lc]?.content ?? null;
            const seo_title = result.byLocale?.[lc]?.seoTitle ?? null;
            const seo_description = result.byLocale?.[lc]?.seoDescription ?? null;
            if (!content && !seo_title && !seo_description) continue;
            await supabase
              .from('post_translations')
              .upsert({
                post_id: payload.postId,
                locale: lc,
                title: payload.title || 'Draft',
                slug: payload.slug || `draft-${lc}`,
                body_md: content,
                seo_title,
                seo_description,
              }, { onConflict: 'post_id,locale' });
          }
        } else {
          const lc = payload.locale as string | undefined;
          const content = result.content ?? null;
          if (lc && content) {
            await supabase
              .from('post_translations')
              .upsert({
                post_id: payload.postId,
                locale: lc,
                title: payload.title || 'Draft',
                slug: payload.slug || `draft-${lc}`,
                body_md: content,
              }, { onConflict: 'post_id,locale' });
          }
        }
      }
      updateJob(job.id, { status: 'done', payload: { ...payload, result } });
    } else {
      // TODO: implement uniqueness job
      updateJob(job.id, { status: 'done' });
    }
    return NextResponse.json({ ok: true, job });
  } catch (e) {
    updateJob(job.id, { status: 'failed' });
    return NextResponse.json({ ok: false, error: 'job_failed', id: job.id }, { status: 500 });
  }
}


