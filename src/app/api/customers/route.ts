import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') ?? ''
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const from   = (page - 1) * limit
  const to     = from + limit - 1

  const sb = getSupabaseServer()
  let query = sb.from('customers').select('*', { count: 'exact' })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, count, error } = await query
    .order('full_name')
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customers: data, total: count })
}
