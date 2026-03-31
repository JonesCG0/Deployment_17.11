'use client'

import { useEffect, useState, use } from 'react'
import type { Order } from '@/lib/types'

interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
}

export default function OrderHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }                    = use(params)
  const [data, setData]           = useState<OrdersResponse | null>(null)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    fetch(`/api/customer/${id}/orders?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [id, page])

  const totalPages = data ? Math.ceil(data.total / limit) : 1

  return (
    <div>
      <a href={`/customer/${id}`} className="text-sm text-blue-600 hover:underline">← Back to Dashboard</a>
      <h1 className="text-2xl font-bold mt-2 mb-6">Order History</h1>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {data?.orders.map((o) => {
                  const ship = Array.isArray(o.shipments) ? o.shipments[0] : null
                  return (
                    <tr key={o.order_id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{o.order_id.slice(0, 8)}…</td>
                      <td className="px-4 py-3">{new Date(o.order_datetime).toLocaleDateString()}</td>
                      <td className="px-4 py-3">${(o.order_total ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 capitalize">{o.payment_method?.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        {ship ? (
                          <span className={`px-2 py-0.5 rounded text-xs ${ship.late_delivery ? 'bg-red-100 text-red-700' : ship.late_delivery === false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {ship.late_delivery ? 'Late' : ship.late_delivery === false ? 'On Time' : 'Pending'}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
                {!data?.orders.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{data?.total ?? 0} order{data?.total !== 1 ? 's' : ''}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">← Prev</button>
              <span className="px-3 py-1">{page} / {totalPages || 1}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
