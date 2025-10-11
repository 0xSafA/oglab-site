import { getSupabaseServer } from '@/lib/supabase-client';
import { jsonLdFAQ } from '@/lib/jsonld';
import { alternatesFromTranslations, robotsFromNoindex } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type Params = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: Params) {
  const supabase = getSupabaseServer();
  const { data: t } = await supabase
    .from('faq_translations')
    .select('faq_id, locale, question:question, answer_md:answer_md')
    .eq('locale', params.locale)
    .single();
  if (!t) return {};
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  return {
    title: t.question,
    robots: robotsFromNoindex(false),
    alternates: undefined
  };
}

export default async function FAQPage({ params }: Params) {
  const supabase = getSupabaseServer();
  const { data: t } = await supabase
    .from('faq_translations')
    .select('question, answer_md')
    .eq('locale', params.locale)
    .single();
  if (!t) return <div className="mx-auto max-w-3xl p-6">Not found</div>;
  const ld = jsonLdFAQ([{ q: t.question, a: t.answer_md }]);
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{t.question}</h1>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="prose prose-invert max-w-none whitespace-pre-wrap">{t.answer_md}</article>
    </div>
  );
}


