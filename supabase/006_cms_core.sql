-- CMS core migration
-- Adds: per-locale publish flags, galleries, FAQs, taxonomy, revisions,
-- compliance/glossary, redirects, external accounts, guest-post links,
-- uniqueness helpers, and author stats view.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 1) Extend post_translations with publish flags and scheduling
do $$ begin
  alter table post_translations add column if not exists is_published boolean not null default false;
exception when undefined_column then null; end $$;

do $$ begin
  alter table post_translations add column if not exists published_at timestamptz;
exception when undefined_column then null; end $$;

do $$ begin
  alter table post_translations add column if not exists scheduled_at timestamptz;
exception when undefined_column then null; end $$;

-- 2) Core content enrichments on posts
do $$ begin
  alter table posts add column if not exists short_answer text;
exception when undefined_column then null; end $$;

do $$ begin
  alter table posts add column if not exists tldr text;
exception when undefined_column then null; end $$;

do $$ begin
  alter table posts add column if not exists sources jsonb;
exception when undefined_column then null; end $$;

do $$ begin
  alter table posts add column if not exists geo_tags text[];
exception when undefined_column then null; end $$;

-- 3) Media and galleries
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  type text not null, -- image|video
  size_bytes bigint,
  owner_user_id uuid,
  created_at timestamptz default now()
);

create table if not exists post_galleries (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  title text,
  created_at timestamptz default now()
);

create table if not exists post_gallery_items (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references post_galleries(id) on delete cascade,
  media_id uuid not null references media(id) on delete restrict,
  alt_localized jsonb,
  sort_order int default 0
);
create index if not exists idx_post_gallery_items_gallery on post_gallery_items(gallery_id);

-- 4) FAQ
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists faq_translations (
  id uuid primary key default gen_random_uuid(),
  faq_id uuid not null references faqs(id) on delete cascade,
  locale text not null,
  question text not null,
  answer_md text not null,
  unique (faq_id, locale)
);

-- 5) Taxonomy
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null
);

create table if not exists post_tags (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- 6) Revisions
create table if not exists post_translation_revisions (
  id uuid primary key default gen_random_uuid(),
  translation_id uuid not null references post_translations(id) on delete cascade,
  editor_user_id uuid,
  body_md text,
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);

-- 7) Compliance/glossary
create table if not exists compliance_rule_sets (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('reddit','medium')),
  rules jsonb not null
);

create table if not exists glossary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  preferred_translation jsonb
);

-- 8) Redirects
create table if not exists url_redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text unique not null,
  to_path text not null,
  created_at timestamptz default now()
);

-- 9) External accounts for platforms
create table if not exists external_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  platform text not null check (platform in ('reddit','medium')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 10) Guest post → receiver linkage
create table if not exists guest_post_links (
  guest_post_id uuid primary key references posts(id) on delete cascade,
  receiver_post_id uuid not null references posts(id) on delete cascade
);

-- 11) Index helpers
create index if not exists idx_posts_geo_tags on posts using gin (geo_tags);
create index if not exists idx_pt_locale_slug on post_translations(locale, slug);
create index if not exists idx_pt_is_published on post_translations(is_published);

-- 12) Author stats view
drop materialized view if exists author_stats;
create materialized view author_stats as
select
  p.author_id as user_id,
  count(p.*) filter (where p.status = 'published') as published_posts,
  count(pt.*) filter (where coalesce(pt.is_published, false)) as published_translations,
  sum(length(coalesce(pt.body_md,''))) as total_chars,
  date_trunc('month', coalesce(pt.published_at, p.published_at)) as period
from posts p
left join post_translations pt on pt.post_id = p.id
group by 1,5;

-- refresh concurrently recommended in jobs


