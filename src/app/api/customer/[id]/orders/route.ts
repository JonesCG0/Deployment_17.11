import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = req.nextUrl
  const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  const sb = getSupabaseServer()
  const { data, count, error } = await sb
    .from('orders')
    .select('*, shipments(*)', { count: 'exact' })
    .eq('customer_id', id)
    .order('order_datetime', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data, total: count, page, limit })
}
