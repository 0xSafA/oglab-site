import { getSupabaseServer } from '@/lib/supabase-client';
import { jsonLdArticle } from '@/lib/jsonld';

export default async function PreviewPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServer();
  const { data: t } = await supabase
    .from('post_translations')
    .select('post_id, locale, title, slug, seo_title, seo_description, body_md, preview_token, noindex')
    .eq('preview_token', params.token)
    .single();

  if (!t) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Not found</h1>
      </div>
    );
  }

  const articleLd = jsonLdArticle({
    headline: t.seo_title || t.title || '',
    description: t.seo_description || undefined,
  });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <h1 className="text-2xl font-semibold">{t.title}</h1>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <article className="prose prose-invert max-w-none whitespace-pre-wrap">
        {t.body_md}
      </article>
    </div>
  );
}


