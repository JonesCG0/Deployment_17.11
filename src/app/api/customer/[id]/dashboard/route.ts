import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseServer()

  const [{ data: orders, error: ordersErr }, { data: customer, error: custErr }] =
    await Promise.all([
      sb.from('orders').select('order_id, order_datetime, order_total, payment_method, shipments(late_delivery, late_score)').eq('customer_id', id).order('order_datetime', { ascending: false }),
      sb.from('customers').select('*').eq('customer_id', id).single(),
    ])

  if (ordersErr) return NextResponse.json({ error: ordersErr.message }, { status: 500 })
  if (custErr)   return NextResponse.json({ error: custErr.message },   { status: 404 })

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const total_orders    = orders?.length ?? 0
  const lifetime_spend  = orders?.reduce((sum, o) => sum + (o.order_total ?? 0), 0) ?? 0
  const avg_order_value = total_orders > 0 ? lifetime_spend / total_orders : 0
  const orders_this_month = orders?.filter((o) => o.order_datetime?.startsWith(thisMonth)).length ?? 0
  const recent_orders   = orders?.slice(0, 5) ?? []

  return NextResponse.json({
    customer,
    stats: { total_orders, lifetime_spend, avg_order_value, orders_this_month },
    recent_orders,
  })
}
