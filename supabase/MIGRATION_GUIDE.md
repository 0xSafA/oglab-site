# Supabase Migration Guide - AI Agent Enterprise

## 📋 Prerequisites

1. **Supabase Project** - Make sure you have a Supabase project
2. **Database Access** - Access to SQL Editor in Supabase Dashboard
3. **Backup** - Backup existing data if you have any

## 🚀 How to Apply Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply Migrations in Order**
   
   **Step 1: Create Tables**
   ```bash
   # Copy contents of: migrations/001_create_agent_tables.sql
   # Paste into SQL Editor
   # Click "Run" or press Cmd/Ctrl + Enter
   ```
   
   **Step 2: Create Functions & Triggers**
   ```bash
   # Copy contents of: migrations/002_create_functions_triggers.sql
   # Paste into SQL Editor
   # Click "Run"
   ```
   
   **Step 3: Enable RLS Policies**
   ```bash
   # Copy contents of: migrations/003_enable_rls_policies.sql
   # Paste into SQL Editor
   # Click "Run"
   ```
   
   **Step 4: Seed Data (Optional)**
   ```bash
   # Copy contents of: migrations/004_seed_initial_data.sql
   # Uncomment test data you want
   # Paste into SQL Editor
   # Click "Run"
   ```

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push

# Or apply one by one
supabase db execute -f supabase/migrations/001_create_agent_tables.sql
supabase db execute -f supabase/migrations/002_create_functions_triggers.sql
supabase db execute -f supabase/migrations/003_enable_rls_policies.sql
```

## ✅ Verification

After running migrations, verify everything is set up correctly:

### 1. Check Tables

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'conversations', 'orders', 'agent_events')
ORDER BY tablename;
```

Should return 4 tables.

### 2. Check Indexes

```sql
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'conversations', 'orders', 'agent_events')
ORDER BY tablename, indexname;
```

Should return ~20 indexes.

### 3. Check Functions

```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_order_number',
    'get_today_metrics',
    'get_top_products'
  )
ORDER BY routine_name;
```

Should return the helper functions.

### 4. Check Triggers

```sql
SELECT
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

Should show triggers on orders, conversations, user_profiles.

### 5. Check RLS Policies

```sql
SELECT
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should show policies for all 4 tables.

### 6. Test Helper Functions

```sql
-- Test today's metrics
SELECT * FROM get_today_metrics();

-- Should return a row with metrics (all zeros if no data yet)
```

## 🔧 Environment Variables

Add these to your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For API calls
SUPABASE_URL=https://your-project.supabase.co
```

Get these values from:
- Supabase Dashboard → Project Settings → API

## 📊 Table Overview

| Table | Purpose | Estimated Size |
|-------|---------|----------------|
| `user_profiles` | User accounts & preferences | 1 KB/user |
| `conversations` | Chat history | 10-50 KB/conversation |
| `orders` | Order queue & tracking | 2-5 KB/order |
| `agent_events` | Analytics events | 0.5 KB/event |

## 🔒 Security Notes

1. **RLS is Enabled** - All tables have Row Level Security enabled
2. **Service Role** - API uses service_role key (has full access)
3. **User Access** - Users can only see their own data
4. **Staff Access** - Admin/Staff roles can see all data

## 🗄️ Backup & Restore

### Create Backup

```sql
-- Export specific table
COPY user_profiles TO '/tmp/user_profiles_backup.csv' CSV HEADER;

-- Or use Supabase Dashboard:
-- Database → Backups → Create Backup
```

### Restore from Backup

```sql
-- Import from CSV
COPY user_profiles FROM '/tmp/user_profiles_backup.csv' CSV HEADER;
```

## 🐛 Troubleshooting

### Error: "relation already exists"

**Solution:** Table already created. Safe to ignore or drop table first:
```sql
DROP TABLE IF EXISTS table_name CASCADE;
-- Then re-run migration
```

### Error: "permission denied"

**Solution:** Make sure you're connected as project owner or have necessary permissions.

### Error: "function already exists"

**Solution:** Drop function first:
```sql
DROP FUNCTION IF EXISTS function_name CASCADE;
-- Then re-run migration
```

### RLS Blocking Access

**Solution:** Check if you're using the correct key:
- Frontend: Use `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- API: Use `SUPABASE_SERVICE_ROLE_KEY`

## 📈 Performance Considerations

1. **Indexes Created** - All foreign keys and frequently queried fields indexed
2. **JSONB Columns** - Flexible but slightly slower than regular columns
3. **Partitioning** - Consider partitioning `agent_events` if > 10M rows

## 🔄 Migration Strategy for Existing Users

If you have users in localStorage, migrate them:

```typescript
// Run once on client-side
async function migrateLocalStorageToSupabase() {
  const localProfile = localStorage.getItem('oglab_user_profile_v1');
  
  if (localProfile) {
    const profile = JSON.parse(localProfile);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: profile.userId,
        first_visit: profile.firstVisit,
        last_visit: profile.lastVisit,
        total_conversations: profile.totalConversations,
        total_messages: profile.totalMessages,
        preferences: profile.preferences,
      })
      .select()
      .single();
    
    if (!error) {
      console.log('✅ Migrated to Supabase');
      // Keep localStorage as backup for 30 days
      localStorage.setItem('oglab_migrated_at', new Date().toISOString());
    }
  }
}
```

## 📚 Next Steps

After migrations are complete:

1. ✅ Test queries in SQL Editor
2. ✅ Set up `.env.local` with Supabase keys
3. ✅ Create `lib/supabase-client.ts` helper
4. ✅ Create `lib/user-profile-db.ts` for profile operations
5. ✅ Update `OGLabAgent` component to use Supabase
6. ✅ Test end-to-end flow

## 🆘 Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables
4. Check RLS policies are not blocking access

## 📝 Maintenance

### Regular Tasks

- **Weekly:** Check table sizes and performance
- **Monthly:** Analyze slow queries
- **Quarterly:** Review and optimize indexes

### Monitoring Queries

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries (if pg_stat_statements enabled)
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

**Ready to start?** Copy the SQL files one by one into Supabase SQL Editor and run them! 🚀


