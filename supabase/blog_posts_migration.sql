-- Blog posts and translations schema
-- Creates: posts, post_translations

-- extensions
create extension if not exists pgcrypto;

-- base posts table (EN source of truth)
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft','published')),
  author_id uuid,
  cover_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_status on posts (status);
create index if not exists idx_posts_published_at on posts (published_at);

-- localized translations
create table if not exists post_translations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  locale text not null,
  title text not null,
  slug text not null,
  excerpt text,
  body_md text,
  seo_title text,
  seo_description text,
  og_image_url text,
  translation_source text check (translation_source in ('ai','human')),
  review_status text not null default 'needs_review' check (review_status in ('needs_review','approved')),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, locale)
);

-- helpful indexes
create index if not exists idx_post_translations_post_locale on post_translations (post_id, locale);
create index if not exists idx_post_translations_locale_slug on post_translations (locale, slug);


