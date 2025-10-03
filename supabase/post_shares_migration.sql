-- post_shares and post_share_metrics migration
-- Requires: post_translations table to exist

-- extensions
create extension if not exists pgcrypto;

do $$ begin
  create type share_platform as enum ('reddit','medium','twitter','facebook','instagram','tripadvisor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type share_status as enum ('draft','scheduled','published','failed');
exception when duplicate_object then null; end $$;

create table if not exists post_shares (
  id uuid primary key default gen_random_uuid(),
  post_translation_id uuid not null references post_translations(id) on delete cascade,
  platform share_platform not null,
  locale text not null,
  title_override text,
  content_md text,
  media_refs jsonb,
  utm_source text,
  utm_campaign text,
  status share_status not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  external_post_id text,
  external_url text,
  moderation_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists uniq_share_per_translation_platform
  on post_shares (post_translation_id, platform)
  where status = 'published';

create index if not exists idx_post_shares_platform_status on post_shares (platform, status);
create index if not exists idx_post_shares_scheduled_at on post_shares (scheduled_at);

create table if not exists post_share_metrics (
  id uuid primary key default gen_random_uuid(),
  post_share_id uuid not null references post_shares(id) on delete cascade,
  fetched_at timestamptz not null default now(),
  impressions bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  saves bigint
);


