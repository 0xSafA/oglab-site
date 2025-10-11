import { getSupabaseServer } from '@/lib/supabase-client';

export default async function sitemap() {
  const supabase = getSupabaseServer();
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const { data } = await supabase
    .from('post_translations')
    .select('locale, slug, is_published, noindex, published_at')
    .eq('is_published', true)
    .neq('noindex', true)
    .order('published_at', { ascending: false })
    .limit(5000);
  const routes = (data || []).map((t: any) => ({ url: `${base}/${t.locale}/blog/${t.slug}`, lastModified: t.published_at || new Date().toISOString() }));
  return routes;
}


