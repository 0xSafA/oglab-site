import { getSupabaseServer } from '@/lib/supabase-client';
import { AuthorEditor } from '@/components/AuthorEditor';

export default async function EditAuthorPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer();
  const { data: profile } = await supabase
    .from('author_profiles')
    .select('display_name, bio, credentials, photo_url, links, verified_at')
    .eq('user_id', params.id)
    .single();
  const p = profile || { display_name: '', bio: '', credentials: '', photo_url: '', links: {} };
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Edit Author</h1>
      {/* @ts-expect-error Server/Client interop */}
      <AuthorEditor userId={params.id} initial={p} />
    </div>
  );
}


