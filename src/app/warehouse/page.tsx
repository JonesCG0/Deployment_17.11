'use client'

import { useEffect, useState } from 'react'
import type { WarehouseRow } from '@/lib/types'

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-xs">—</span>
  const pct = Math.round(score * 100)
  const color =
    score > 0.7  ? 'bg-red-100 text-red-700' :
    score >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                   'bg-green-100 text-green-700'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{pct}%</span>
  )
}

export default function WarehousePage() {
  const [rows, setRows]       = useState<WarehouseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [scored, setScored]   = useState<number | null>(null)

  useEffect(() => {
    // Initial load: top 50 already-scored shipments (may be empty before first Run Scoring)
    fetch('/api/score', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => { setRows(d.top50 ?? []); setScored(d.scored ?? null) })
      .finally(() => setLoading(false))
  }, [])

  async function runScoring() {
    setScoring(true)
    try {
      const res  = await fetch('/api/score', { method: 'POST' })
      const data = await res.json()
      setRows(data.top50 ?? [])
      setScored(data.scored ?? null)
    } finally {
      setScoring(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Late Delivery Priority Queue</h1>
          <p className="text-gray-500 text-sm mt-1">Top 50 shipments by predicted late-delivery probability</p>
        </div>
        <button
          onClick={runScoring}
          disabled={scoring}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {scoring && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {scoring ? 'Scoring…' : 'Run Scoring'}
        </button>
      </div>

      {scored !== null && (
        <p className="text-xs text-gray-500 mb-4">Last run scored {scored.toLocaleString()} shipments.</p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Carrier</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Distance</th>
                <th className="px-4 py-3 font-semibold">Promised</th>
                <th className="px-4 py-3 font-semibold">Actual</th>
                <th className="px-4 py-3 font-semibold">Late Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.shipment_id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.orders ? (
                      <a href={`/customer/${row.orders.customer_id}`} className="text-blue-600 hover:underline">
                        {row.order_id.slice(0, 8)}…
                      </a>
                    ) : (
                      <span>{row.order_id.slice(0, 8)}…</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {row.orders?.customer_id?.slice(0, 8) ?? '—'}…
                  </td>
                  <td className="px-4 py-3">{row.carrier}</td>
                  <td className="px-4 py-3">{row.shipping_method}</td>
                  <td className="px-4 py-3">{row.distance_band}</td>
                  <td className="px-4 py-3">{row.promised_days}d</td>
                  <td className="px-4 py-3">{row.actual_days != null ? `${row.actual_days}d` : '—'}</td>
                  <td className="px-4 py-3"><ScoreBadge score={row.late_score} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    No scored shipments yet. Click <strong>Run Scoring</strong> to generate predictions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
