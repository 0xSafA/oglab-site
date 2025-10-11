-- CMS RLS policies and triggers

create extension if not exists pgcrypto;

-- Helper: set updated_at timestamp
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

-- Helper: determine role from JWT or profiles
create or replace function is_role(target text)
returns boolean language sql stable as $$
  select coalesce(
    (auth.jwt() ->> 'role') = target,
    exists(
      select 1 from profiles p
      where p.id = auth.uid() and p.role = target
    )
  );
$$;

create or replace function is_admin() returns boolean language sql stable as $$
  select is_role('admin');
$$;

create or replace function is_editor() returns boolean language sql stable as $$
  select is_role('editor') or is_admin();
$$;

create or replace function is_moderator() returns boolean language sql stable as $$
  select is_role('moderator') or is_editor();
$$;

-- Helper: build localized blog path (adjust base if needed)
create or replace function build_blog_path(p_locale text, p_slug text)
returns text language sql immutable as $$
  select '/' || coalesce(p_locale,'en') || '/blog/' || p_slug;
$$;

-- Redirects on slug change for post_translations
create or replace function handle_slug_redirect()
returns trigger language plpgsql as $$
declare
  old_path text;
  new_path text;
begin
  if coalesce(old.slug,'') <> coalesce(new.slug,'') then
    old_path := build_blog_path(old.locale, old.slug);
    new_path := build_blog_path(new.locale, new.slug);
    if old.slug is not null and new.slug is not null then
      insert into url_redirects(from_path, to_path)
      values (old_path, new_path)
      on conflict (from_path) do update set to_path = excluded.to_path;
    end if;
  end if;
  return new;
end; $$;

-- Attach updated_at triggers
do $$ begin
  create trigger trg_posts_updated_at
  before update on posts
  for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_post_translations_updated_at
  before update on post_translations
  for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_media_updated_at
  before update on media
  for each row execute function set_updated_at();
exception when undefined_table then null; end $$;

do $$ begin
  create trigger trg_post_galleries_updated_at
  before update on post_galleries
  for each row execute function set_updated_at();
exception when undefined_table then null; end $$;

do $$ begin
  create trigger trg_post_gallery_items_updated_at
  before update on post_gallery_items
  for each row execute function set_updated_at();
exception when undefined_table then null; end $$;

-- Attach slug redirect trigger
do $$ begin
  create trigger trg_post_translations_slug_redirect
  before update on post_translations
  for each row execute function handle_slug_redirect();
exception when duplicate_object then null; end $$;

-- Enable RLS
alter table if exists posts enable row level security;
alter table if exists post_translations enable row level security;
alter table if exists faqs enable row level security;
alter table if exists faq_translations enable row level security;

-- Policies: Posts
do $$ begin
  create policy read_posts_published on posts
    for select using (
      exists (
        select 1 from post_translations pt
        where pt.post_id = posts.id and coalesce(pt.is_published,false) = true
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy manage_own_posts on posts
    for all using (auth.uid() = posts.author_id)
    with check (auth.uid() = posts.author_id or is_editor());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy editor_full_posts on posts
    for all using (is_editor()) with check (is_editor());
exception when duplicate_object then null; end $$;

-- Policies: Post translations
do $$ begin
  create policy read_post_translations_published on post_translations
    for select using (coalesce(is_published,false) = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy manage_translations_own_post on post_translations
    for all using (
      exists (
        select 1 from posts p
        where p.id = post_translations.post_id
          and (p.author_id = auth.uid() or is_editor())
      )
    ) with check (
      exists (
        select 1 from posts p2
        where p2.id = post_translations.post_id
          and (p2.author_id = auth.uid() or is_editor())
      )
    );
exception when duplicate_object then null; end $$;

-- Policies: FAQ
do $$ begin
  create policy read_faqs_all on faqs for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy manage_faqs_editors on faqs for all using (is_editor()) with check (is_editor());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy read_faq_translations_all on faq_translations for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy manage_faq_translations_editors on faq_translations for all using (is_editor()) with check (is_editor());
exception when duplicate_object then null; end $$;


