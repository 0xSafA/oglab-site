import { getSupabaseServer } from '@/lib/supabase-client';
import { jsonLdArticle, jsonLdFAQ } from '@/lib/jsonld';
import { alternatesFromTranslations, robotsFromNoindex } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type Params = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: Params) {
  const supabase = getSupabaseServer();
  const { data: t } = await supabase
    .from('post_translations')
    .select('id, post_id, locale, slug, seo_title, seo_description, is_published, noindex')
    .eq('locale', params.locale)
    .eq('slug', params.slug)
    .single();
  if (!t) return {};
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const { data: all } = await supabase
    .from('post_translations')
    .select('locale, slug')
    .eq('post_id', t.post_id)
    .eq('is_published', true);
  return {
    title: t.seo_title || undefined,
    description: t.seo_description || undefined,
    alternates: all ? alternatesFromTranslations(base, all as any) : undefined,
    robots: robotsFromNoindex(t.noindex),
  };
}

export default async function ArticlePage({ params }: Params) {
  const supabase = getSupabaseServer();
  const { data: t } = await supabase
    .from('post_translations')
    .select('post_id, locale, title, slug, seo_title, seo_description, body_md, noindex')
    .eq('locale', params.locale)
    .eq('slug', params.slug)
    .single();
  if (!t) {
    return <div className="mx-auto max-w-3xl p-6">Not found</div>;
  }
  const ld = jsonLdArticle({
    headline: t.seo_title || t.title || '',
    description: t.seo_description || undefined,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/${params.locale}/blog/${params.slug}`,
  });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      {t.noindex && (
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
      )}
      <h1 className="text-2xl font-semibold">{t.title}</h1>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="prose prose-invert max-w-none whitespace-pre-wrap">{t.body_md}</article>
    </div>
  );
}


