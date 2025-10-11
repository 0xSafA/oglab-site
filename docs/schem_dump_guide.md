## Supabase Schema Dump Guide

Purpose: keep a canonical, read-only schema snapshot in `docs/DB_SCHEMA.sql` for reference. Regenerate on demand with Supabase CLI.

### Prerequisites
- Supabase CLI installed: `npm i -g supabase`
- Logged in: `supabase login`
- Linked project: `supabase link --project-ref <ref>`

### Dump commands

1) Full public schema (DDL only, no data):

```bash
supabase db dump \
  --db-url "$SUPABASE_DB_URL" \
  --schema public \
  --data-only=false \
  --roles-only=false \
  --table '*' \
  --file docs/DB_SCHEMA.sql
```

2) Exclude data and extensions explicitly (safe default):

```bash
supabase db dump \
  --db-url "$SUPABASE_DB_URL" \
  --schema public \
  --data-only=false \
  --exclude-extension '*' \
  --file docs/DB_SCHEMA.sql
```

Notes:
- Use `$SUPABASE_DB_URL` with service role or admin credentials for complete DDL.
- Commit `docs/DB_SCHEMA.sql` to git for reference only.
- Do not use dumps as migrations; continue using numbered SQL migrations in environments where migrations are needed.

### NPM script

Add to `package.json`:

```json
{
  "scripts": {
    "schema:dump": "supabase db dump --db-url \"$SUPABASE_DB_URL\" --schema public --data-only=false --exclude-extension '*' --file docs/DB_SCHEMA.sql"
  }
}
```

Run:

```bash
npm run schema:dump
```


