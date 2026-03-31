import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

interface ShipmentRow {
  shipment_id: string
  promised_days: number
  actual_days: number | null
  distance_band: string
  carrier: string
}

/**
 * Rule-based late-delivery scoring heuristic.
 * Swap this function body for a real sklearn model call when Part 2 is complete.
 */
function computeLateScore(s: ShipmentRow): number {
  const actual  = s.actual_days ?? s.promised_days
  const overage = (actual - s.promised_days) / Math.max(s.promised_days, 1)

  const distanceWeight: Record<string, number> = {
    LOCAL:         0.0,
    REGIONAL:      0.1,
    NATIONAL:      0.25,
    INTERNATIONAL: 0.45,
  }
  const carrierWeight: Record<string, number> = {
    UPS:   0.0,
    FedEx: 0.05,
    USPS:  0.20,
    DHL:   0.15,
  }

  const z =
    overage * 2.5 +
    (distanceWeight[s.distance_band] ?? 0.15) +
    (carrierWeight[s.carrier]        ?? 0.10)

  const score = 1 / (1 + Math.exp(-z))
  return Math.round(score * 10000) / 10000
}

export async function POST() {
  const sb = getSupabaseServer()

  // Fetch all shipments needed for scoring
  const { data: shipments, error: fetchErr } = await sb
    .from('shipments')
    .select('shipment_id, promised_days, actual_days, distance_band, carrier')

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  // Compute scores
  const scored = (shipments as ShipmentRow[]).map((s) => ({
    shipment_id: s.shipment_id,
    late_score:  computeLateScore(s),
  }))

  // Batch-update in chunks of 100
  const CHUNK = 100
  for (let i = 0; i < scored.length; i += CHUNK) {
    const chunk = scored.slice(i, i + CHUNK)
    await Promise.all(
      chunk.map(({ shipment_id, late_score }) =>
        sb.from('shipments').update({ late_score }).eq('shipment_id', shipment_id)
      )
    )
  }

  // Return top 50
  const { data: top50, error: topErr } = await sb
    .from('shipments')
    .select('*, orders(order_id, customer_id, order_datetime, order_total)')
    .order('late_score', { ascending: false })
    .limit(50)

  if (topErr) return NextResponse.json({ error: topErr.message }, { status: 500 })

  return NextResponse.json({ scored: scored.length, top50 })
}
