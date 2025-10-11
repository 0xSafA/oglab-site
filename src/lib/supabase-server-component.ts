/**
 * Supabase client for Server Components (uses next/headers cookies)
 * Use ONLY in App Router Server Components
 */
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './supabase-client';

export async function getSupabaseServerComponent() {
  const cookieStore = await cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}


