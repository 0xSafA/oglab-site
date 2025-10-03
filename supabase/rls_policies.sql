-- RLS policies and helper function for blog/cross-posting

-- helper: check admin role via profiles
create or replace function is_admin(u uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from profiles p where p.id = u and p.role = 'admin'
  );
$$;

-- enable RLS
alter table if exists posts enable row level security;
alter table if exists post_translations enable row level security;
alter table if exists post_shares enable row level security;
alter table if exists post_share_metrics enable row level security;

-- POSTS
drop policy if exists posts_select_published_or_admin on posts;
create policy posts_select_published_or_admin on posts
for select
using (
  status = 'published' or is_admin(auth.uid())
);

drop policy if exists posts_admin_insert on posts;
create policy posts_admin_insert on posts
for insert
with check (is_admin(auth.uid()));

drop policy if exists posts_admin_update on posts;
create policy posts_admin_update on posts
for update
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

drop policy if exists posts_admin_delete on posts;
create policy posts_admin_delete on posts
for delete
using (is_admin(auth.uid()));

-- POST_TRANSLATIONS
drop policy if exists post_translations_select_published_or_admin on post_translations;
create policy post_translations_select_published_or_admin on post_translations
for select
using (
  exists (
    select 1 from posts p
    where p.id = post_translations.post_id
      and (p.status = 'published' or is_admin(auth.uid()))
  )
);

drop policy if exists post_translations_admin_insert on post_translations;
create policy post_translations_admin_insert on post_translations
for insert
with check (is_admin(auth.uid()));

drop policy if exists post_translations_admin_update on post_translations;
create policy post_translations_admin_update on post_translations
for update
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

drop policy if exists post_translations_admin_delete on post_translations;
create policy post_translations_admin_delete on post_translations
for delete
using (is_admin(auth.uid()));

-- POST_SHARES (admin write, authenticated read)
drop policy if exists post_shares_select_authenticated on post_shares;
create policy post_shares_select_authenticated on post_shares
for select
to authenticated
using (true);

drop policy if exists post_shares_admin_insert on post_shares;
create policy post_shares_admin_insert on post_shares
for insert
with check (is_admin(auth.uid()));

drop policy if exists post_shares_admin_update on post_shares;
create policy post_shares_admin_update on post_shares
for update
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

drop policy if exists post_shares_admin_delete on post_shares;
create policy post_shares_admin_delete on post_shares
for delete
using (is_admin(auth.uid()));

-- POST_SHARE_METRICS (admin write, authenticated read)
drop policy if exists post_share_metrics_select_authenticated on post_share_metrics;
create policy post_share_metrics_select_authenticated on post_share_metrics
for select
to authenticated
using (true);

drop policy if exists post_share_metrics_admin_insert on post_share_metrics;
create policy post_share_metrics_admin_insert on post_share_metrics
for insert
with check (is_admin(auth.uid()));

drop policy if exists post_share_metrics_admin_update on post_share_metrics;
create policy post_share_metrics_admin_update on post_share_metrics
for update
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

drop policy if exists post_share_metrics_admin_delete on post_share_metrics;
create policy post_share_metrics_admin_delete on post_share_metrics
for delete
using (is_admin(auth.uid()));

-- convenience view: latest metrics per share
drop view if exists post_shares_latest_metrics cascade;
create view post_shares_latest_metrics as
select
  ps.*,
  m.impressions,
  m.likes,
  m.comments,
  m.shares,
  m.saves,
  m.fetched_at as metrics_fetched_at
from post_shares ps
left join lateral (
  select * from post_share_metrics mm
  where mm.post_share_id = ps.id
  order by mm.fetched_at desc
  limit 1
) m on true;


