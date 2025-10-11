-- Author profiles (E-E-A-T fields)

create extension if not exists pgcrypto;

create table if not exists author_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  display_name text,
  bio text,
  credentials text,           -- degrees, certifications, roles
  photo_url text,
  links jsonb,                -- { website, linkedin, orcid, twitter }
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at trigger (reuses set_updated_at if present)
do $$ begin
  create trigger trg_author_profiles_updated_at
  before update on author_profiles
  for each row execute function set_updated_at();
exception when undefined_function then null; end $$;


