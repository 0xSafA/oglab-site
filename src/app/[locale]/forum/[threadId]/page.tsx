import { getSupabaseServer } from '@/lib/supabase-client';
import { jsonLdQAPage } from '@/lib/jsonld';
import { ThreadClient } from '@/components/forum/ThreadClient';

async function getThread(threadId: string) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('forum_threads')
    .select('id, title, best_post_id, created_at')
    .eq('id', threadId)
    .single();
  return data;
}

async function getPosts(threadId: string) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('forum_posts')
    .select('id, author_user_id, body_md, created_at, is_approved')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  return data || [];
}

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const thread = await getThread(params.threadId);
  const posts = await getPosts(params.threadId);
  const qa = jsonLdQAPage({
    question: thread?.title || '',
    answers: posts.map((p: any) => ({ text: p.body_md, dateCreated: p.created_at }))
  });
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{thread?.title}</h1>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(qa) }} />

      {/* @ts-expect-error Server/Client interop */}
      <ThreadClient threadId={thread.id} bestPostId={thread?.best_post_id} initialPosts={posts} />
    </div>
  );
}


