'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Customer } from '@/lib/types'

export default function SelectCustomerPage() {
  const [search, setSearch]       = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const limit = 20

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit) })
    const res  = await fetch(`/api/customers?${params}`)
    const data = await res.json()
    setCustomers(data.customers ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [search, page])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchCustomers() }, 300)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchCustomers() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Select Customer</h1>

      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Segment</th>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customer_id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.city}, {c.state}</td>
                  <td className="px-4 py-3">{c.customer_segment}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{c.loyalty_tier}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/customer/${c.customer_id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View →
                    </a>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>{total} customer{total !== 1 ? 's' : ''}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
          >
            ← Prev
          </button>
          <span className="px-3 py-1">{page} / {totalPages || 1}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
