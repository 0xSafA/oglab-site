import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('post_shares')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()

  // server-side defaults for UTM if missing
  const utm_source = body.utm_source ?? body.platform ?? null
  let utm_campaign = body.utm_campaign ?? null
  if (!utm_campaign) {
    // derive from post_translations.slug-locale if available
    if (body.post_translation_id) {
      const { data: tr } = await supabase
        .from('post_translations')
        .select('slug, locale')
        .eq('id', body.post_translation_id)
        .single()
      if (tr?.slug && tr?.locale) utm_campaign = `${tr.slug}-${tr.locale}`
    }
  }

  const insertPayload = { ...body, utm_source, utm_campaign }

  const { error } = await supabase.from('post_shares').insert(insertPayload)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  // optional revalidation of blog listing page
  try { revalidatePath('/admin/blog') } catch {}
  return NextResponse.json({ ok: true })
}


