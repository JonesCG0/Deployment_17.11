'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, CartItem } from '@/lib/types'

export default function NewOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()

  const [products, setProducts]   = useState<Product[]>([])
  const [cart, setCart]           = useState<CartItem[]>([])
  const [categoryFilter, setFilter] = useState('All')
  const [paymentMethod, setPayment] = useState('credit_card')
  const [shippingZip, setZip]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then(setProducts)
  }, [])

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()]
  const visible    = categoryFilter === 'All' ? products : products.filter((p) => p.category === categoryFilter)

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.product_id === product.product_id)
      if (existing) return prev.map((i) => i.product.product_id === product.product_id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQty(product_id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => i.product.product_id === product_id ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping  = 5.99
  const tax       = subtotal * 0.08
  const total     = subtotal + shipping + tax

  async function placeOrder() {
    if (!cart.length) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/customer/${id}/new-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({ product_id: i.product.product_id, quantity: i.quantity })),
          payment_method: paymentMethod,
          shipping_zip:   shippingZip,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Order failed'); return }
      router.push(`/customer/${id}/orders`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <a href={`/customer/${id}`} className="text-sm text-blue-600 hover:underline">← Back to Dashboard</a>
      <h1 className="text-2xl font-bold mt-2 mb-6">New Order</h1>

      <div className="flex gap-8">
        {/* Product Grid */}
        <div className="flex-1">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm border ${cat === categoryFilter ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visible.map((p) => (
              <div key={p.product_id} className="border border-gray-200 rounded-lg p-3 bg-white">
                <p className="font-medium text-sm mb-1">{p.product_name}</p>
                <p className="text-xs text-gray-500 mb-2">{p.category}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">${p.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(p)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="w-72 shrink-0">
          <div className="border border-gray-200 rounded-lg p-4 bg-white sticky top-4">
            <h2 className="font-semibold mb-3">Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)</h2>

            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm">No items added yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.product.product_id} className="flex items-center justify-between text-sm">
                    <span className="flex-1 truncate">{item.product.product_name}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => updateQty(item.product.product_id, -1)} className="w-5 h-5 border rounded text-center leading-none">−</button>
                      <span className="w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.product_id, +1)} className="w-5 h-5 border rounded text-center leading-none">+</button>
                    </div>
                    <span className="ml-2 font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-3 text-sm space-y-1 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            <div className="space-y-2 mb-3">
              <select
                value={paymentMethod}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="gift_card">Gift Card</option>
              </select>
              <input
                type="text"
                placeholder="Shipping ZIP"
                value={shippingZip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>

            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

            <button
              onClick={placeOrder}
              disabled={!cart.length || submitting}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-40"
            >
              {submitting ? 'Placing…' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
