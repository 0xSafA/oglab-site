import { getSupabaseServer } from '@/lib/supabase-client';

type Params = { params: { locale: string; id: string } };

export default async function AuthorPage({ params }: Params) {
  const supabase = getSupabaseServer();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', params.id)
    .single();

  const { data: author } = await supabase
    .from('author_profiles')
    .select('display_name, bio, credentials, photo_url, links, verified_at')
    .eq('user_id', params.id)
    .single();

  const { data: translations } = await supabase
    .from('post_translations')
    .select('post_id, locale, title, slug, published_at, is_published')
    .order('published_at', { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Author</h1>
      <div className="border rounded p-4 flex gap-4">
        {author?.photo_url && (
          <img src={author.photo_url} alt={author?.display_name || 'Author'} className="w-24 h-24 rounded object-cover" />
        )}
        <div>
          <div className="text-lg font-semibold">{author?.display_name || profile?.email}</div>
          {author?.credentials && <div className="text-sm text-gray-600">{author.credentials}</div>}
          {author?.verified_at && <div className="text-xs text-green-700">Verified: {new Date(author.verified_at).toLocaleDateString()}</div>}
          {author?.bio && <p className="mt-2 whitespace-pre-wrap text-sm">{author.bio}</p>}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Articles</h2>
        <ul className="list-disc ml-6">
          {translations?.map(t => (
            <li key={`${t.post_id}-${t.locale}`}>
              [{t.locale}] {t.title || '(untitled)'} — {t.is_published ? 'published' : 'draft'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


