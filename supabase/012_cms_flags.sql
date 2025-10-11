-- CMS flags: noindex and preview tokens

do $$ begin
  alter table post_translations add column if not exists noindex boolean not null default false;
exception when undefined_table then null; end $$;

do $$ begin
  alter table post_translations add column if not exists preview_token text;
exception when undefined_table then null; end $$;

create index if not exists idx_pt_preview_token on post_translations(preview_token);


