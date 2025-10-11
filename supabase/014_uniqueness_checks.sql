-- Uniqueness checks storage

create type if not exists uniqueness_status as enum ('queued','processing','completed','failed');

create table if not exists uniqueness_checks (
  id uuid primary key default gen_random_uuid(),
  post_translation_id uuid references post_translations(id) on delete cascade,
  provider text not null, -- 'originality' | 'copyleaks'
  status uniqueness_status not null default 'queued',
  score numeric, -- percent unique or similar depending on provider
  details jsonb,
  external_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$ begin
  create trigger trg_uniqueness_checks_updated_at
  before update on uniqueness_checks
  for each row execute function set_updated_at();
exception when undefined_function then null; end $$;


