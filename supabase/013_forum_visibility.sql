-- Forum: publish immediately, allow shadow/delete by moderators

-- 1) Make posts approved by default
do $$ begin
  alter table forum_posts alter column is_approved set default true;
exception when undefined_table then null; end $$;

-- 2) Add shadow flag
do $$ begin
  alter table forum_posts add column if not exists is_shadowed boolean not null default false;
exception when undefined_table then null; end $$;

-- 3) Replace select policy to exclude shadowed posts for public
do $$ begin
  drop policy if exists select_posts_approved on forum_posts;
exception when undefined_object then null; end $$;

-- Public can see approved and not shadowed
do $$ begin
  create policy select_posts_public on forum_posts
    for select using (is_approved = true and is_shadowed = false);
exception when duplicate_object then null; end $$;

-- Authors and moderators can see all
do $$ begin
  create policy select_posts_author_moderator on forum_posts
    for select using (author_user_id = auth.uid() or is_moderator());
exception when duplicate_object then null; end $$;


