import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // allow authenticated users to read; restrict writes to admin
  const { data, error } = await supabase
    .from('post_share_metrics')
    .select('*')
    .eq('post_share_id', params.id)
    .order('fetched_at', { ascending: false })
    .limit(1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data?.[0] || null })
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
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
  const payload = {
    post_share_id: params.id,
    impressions: body.impressions ?? null,
    likes: body.likes ?? null,
    comments: body.comments ?? null,
    shares: body.shares ?? null,
    saves: body.saves ?? null,
  }
  const { error } = await supabase.from('post_share_metrics').insert(payload)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
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
  const payload = {
    impressions: body.impressions ?? null,
    likes: body.likes ?? null,
    comments: body.comments ?? null,
    shares: body.shares ?? null,
    saves: body.saves ?? null,
    fetched_at: new Date().toISOString()
  }
  const { error } = await supabase
    .from('post_share_metrics')
    .update(payload)
    .eq('post_share_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
