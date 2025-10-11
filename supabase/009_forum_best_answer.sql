-- Forum: best answer support

do $$ begin
  alter table if exists forum_threads add column if not exists best_post_id uuid;
exception when undefined_table then null; end $$;

create or replace function set_best_answer(p_thread_id uuid, p_post_id uuid)
returns void language plpgsql as $$
declare
  post_count int;
begin
  select count(*) into post_count from forum_posts where id = p_post_id and thread_id = p_thread_id;
  if post_count = 0 then
    raise exception 'Post does not belong to thread';
  end if;
  update forum_threads set best_post_id = p_post_id where id = p_thread_id;
end; $$;


