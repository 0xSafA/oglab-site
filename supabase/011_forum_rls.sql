-- Forum RLS policies and triggers

create extension if not exists pg_trgm;

-- updated_at triggers (reuse set_updated_at if exists)
do $$ begin
  create trigger trg_forum_threads_updated_at
  before update on forum_threads
  for each row execute function set_updated_at();
exception when undefined_function then null; end $$;

do $$ begin
  create trigger trg_forum_posts_updated_at
  before update on forum_posts
  for each row execute function set_updated_at();
exception when undefined_function then null; end $$;

-- indexes for search and counts
create index if not exists idx_forum_threads_title_trgm on forum_threads using gin (title gin_trgm_ops);
create index if not exists idx_forum_posts_thread_created on forum_posts (thread_id, created_at);

-- Enable RLS
alter table if exists forum_threads enable row level security;
alter table if exists forum_posts enable row level security;
alter table if exists forum_votes enable row level security;

-- Policies: Threads
do $$ begin
  create policy select_threads_all on forum_threads for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy insert_threads_users on forum_threads for insert with check (auth.uid() = author_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy update_threads_owner_or_moderator on forum_threads
    for update using (auth.uid() = author_user_id or is_moderator())
    with check (auth.uid() = author_user_id or is_moderator());
exception when duplicate_object then null; end $$;

-- Policies: Posts
do $$ begin
  create policy select_posts_approved on forum_posts for select using (is_approved = true or is_moderator());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy insert_posts_users on forum_posts for insert with check (auth.uid() = author_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy update_posts_owner_or_moderator on forum_posts
    for update using (auth.uid() = author_user_id or is_moderator())
    with check (auth.uid() = author_user_id or is_moderator());
exception when duplicate_object then null; end $$;

-- Votes: users can upsert their vote
do $$ begin
  create policy select_votes_all on forum_votes for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy upsert_votes_owner on forum_votes
    for all using (auth.uid() = voter_user_id)
    with check (auth.uid() = voter_user_id);
exception when duplicate_object then null; end $$;

-- Daily stats function
create or replace function forum_daily_stats(p_days int default 30)
returns table(day date, threads int, posts int) language sql stable as $$
  with dates as (
    select generate_series(current_date - (p_days::int - 1), current_date, interval '1 day')::date as d
  ), t as (
    select date_trunc('day', created_at)::date as d, count(*) as c from forum_threads group by 1
  ), p as (
    select date_trunc('day', created_at)::date as d, count(*) as c from forum_posts where is_approved = true group by 1
  )
  select d.d as day,
         coalesce(t.c,0) as threads,
         coalesce(p.c,0) as posts
  from dates d
  left join t on t.d = d.d
  left join p on p.d = d.d
  order by day;
$$;


