import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

interface OrderItemInput {
  product_id: string
  quantity: number
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: customer_id } = await params
  const body = await req.json() as {
    items: OrderItemInput[]
    payment_method: string
    shipping_zip: string
  }

  if (!body.items?.length) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  }

  const sb = getSupabaseServer()

  // Look up product prices
  const productIds = body.items.map((i) => i.product_id)
  const { data: products, error: prodErr } = await sb
    .from('products')
    .select('product_id, price')
    .in('product_id', productIds)

  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 })

  const priceMap = Object.fromEntries(products!.map((p) => [p.product_id, p.price as number]))

  // Compute totals
  const order_subtotal = body.items.reduce(
    (sum, item) => sum + (priceMap[item.product_id] ?? 0) * item.quantity,
    0
  )
  const shipping_fee = 5.99
  const tax_amount   = Math.round(order_subtotal * 0.08 * 100) / 100
  const order_total  = Math.round((order_subtotal + shipping_fee + tax_amount) * 100) / 100

  const order_id = crypto.randomUUID()
  const now = new Date().toISOString()

  // Insert order
  const { error: orderErr } = await sb.from('orders').insert({
    order_id,
    customer_id,
    order_datetime:  now,
    shipping_zip:    body.shipping_zip ?? '',
    billing_zip:     '',
    shipping_state:  '',
    payment_method:  body.payment_method ?? 'credit_card',
    device_type:     'web',
    ip_country:      'US',
    promo_used:      false,
    promo_code:      null,
    order_subtotal,
    shipping_fee,
    tax_amount,
    order_total,
    risk_score:      null,
    is_fraud:        null,
  })

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 })

  // Insert order_items
  const items = body.items.map((item) => ({
    order_item_id: crypto.randomUUID(),
    order_id,
    product_id:   item.product_id,
    quantity:     item.quantity,
    unit_price:   priceMap[item.product_id] ?? 0,
    line_total:   Math.round((priceMap[item.product_id] ?? 0) * item.quantity * 100) / 100,
  }))

  const { error: itemsErr } = await sb.from('order_items').insert(items)
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

  // Insert shipment
  const { error: shipErr } = await sb.from('shipments').insert({
    shipment_id:     crypto.randomUUID(),
    order_id,
    ship_datetime:   now,
    carrier:         'UPS',
    shipping_method: 'Ground',
    distance_band:   'REGIONAL',
    promised_days:   5,
    actual_days:     null,
    late_delivery:   null,
    late_score:      null,
  })

  if (shipErr) return NextResponse.json({ error: shipErr.message }, { status: 500 })

  return NextResponse.json({ order_id, order_total }, { status: 201 })
}
