import { notFound } from 'next/navigation'
import type { Customer, Order } from '@/lib/types'

interface DashboardData {
  customer: Customer
  stats: {
    total_orders: number
    lifetime_spend: number
    avg_order_value: number
    orders_this_month: number
  }
  recent_orders: Order[]
}

async function getDashboard(id: string): Promise<DashboardData | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const res  = await fetch(`${base}/api/customer/${id}/dashboard`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function CustomerDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getDashboard(id)
  if (!data) notFound()

  const { customer: c, stats, recent_orders } = data

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <a href="/" className="text-sm text-blue-600 hover:underline">← All Customers</a>
        <h1 className="text-2xl font-bold mt-2">{c.full_name}</h1>
        <p className="text-gray-500 text-sm">{c.email} · {c.city}, {c.state} · {c.customer_segment}</p>
        <span className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{c.loyalty_tier}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders"    value={String(stats.total_orders)} />
        <StatCard label="Lifetime Spend"  value={`$${stats.lifetime_spend.toFixed(2)}`} />
        <StatCard label="Avg Order Value" value={`$${stats.avg_order_value.toFixed(2)}`} />
        <StatCard label="Orders This Month" value={String(stats.orders_this_month)} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <a
          href={`/customer/${id}/new-order`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + New Order
        </a>
        <a
          href={`/customer/${id}/orders`}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
        >
          Order History
        </a>
      </div>

      {/* Recent orders */}
      <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
      <div className="rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Order ID</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
            </tr>
          </thead>
          <tbody>
            {recent_orders.map((o) => (
              <tr key={o.order_id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.order_id.slice(0, 8)}…</td>
                <td className="px-4 py-3">{new Date(o.order_datetime).toLocaleDateString()}</td>
                <td className="px-4 py-3">${(o.order_total ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 capitalize">{o.payment_method?.replace('_', ' ')}</td>
              </tr>
            ))}
            {recent_orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}
