-- CMS helper functions (similarity search, optional utilities)

create extension if not exists pg_trgm;

-- Find similar translations by trigram similarity of body_md or title
create or replace function find_similar_translations(
  p_locale text,
  p_text text,
  p_limit int default 5,
  p_threshold float default 0.2
)
returns table (
  id uuid,
  post_id uuid,
  locale text,
  slug text,
  title text,
  similarity float
) language sql stable as $$
  select
    pt.id,
    pt.post_id,
    pt.locale,
    pt.slug,
    pt.title,
    greatest(similarity(coalesce(pt.body_md,''), p_text), similarity(coalesce(pt.title,''), p_text)) as similarity
  from post_translations pt
  where pt.locale = p_locale
    and (coalesce(pt.body_md,'') % p_text or coalesce(pt.title,'') % p_text)
    and greatest(similarity(coalesce(pt.body_md,''), p_text), similarity(coalesce(pt.title,''), p_text)) >= p_threshold
  order by similarity desc
  limit p_limit;
$$;


