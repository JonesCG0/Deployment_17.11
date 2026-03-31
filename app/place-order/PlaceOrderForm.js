'use client'
import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react';

export default function PlaceOrderForm({ products, action }) {
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(p => p.product_id === product.product_id);
      if (existing) {
        return prev.map(p => p.product_id === product.product_id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(p => p.product_id !== productId));
    } else {
      setCart(prev => prev.map(p => p.product_id === productId ? { ...p, quantity: qty } : p));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await action(cart);
    } catch(e) {
      alert(e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Products */}
      <div className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-silver-50/50 dark:bg-prussian-blue-900/50">
          <h2 className="text-lg font-bold text-foreground">Available Products</h2>
        </div>
        <ul className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {products.map(p => (
            <li key={p.product_id} className="p-5 flex justify-between items-center hover:bg-silver-50 dark:hover:bg-prussian-blue-800/30 transition-colors">
              <div>
                <p className="font-bold text-foreground">{p.product_name}</p>
                <p className="text-sm font-semibold text-foreground/50 mt-0.5">${(p.price || 0).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => addToCart(p)}
                className="group flex items-center justify-center w-10 h-10 bg-cerulean-50 dark:bg-cerulean-900/40 text-cerulean-600 dark:text-cerulean-400 font-bold rounded-xl hover:bg-cerulean-100 dark:hover:bg-cerulean-900/60 transition-colors active:scale-95 duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cerulean-500/50"
                aria-label={`Add ${p.product_name} to cart`}
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Cart */}
      <div className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden flex flex-col sticky top-24">
        <div className="px-6 py-5 border-b border-border bg-silver-50/50 dark:bg-prussian-blue-900/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
          <span className="bg-deep-mocha-100 dark:bg-deep-mocha-900/50 text-deep-mocha-800 dark:text-deep-mocha-300 text-xs font-bold px-3 py-1 rounded-full border border-deep-mocha-200 dark:border-deep-mocha-800">{cart.reduce((s, c) => s + c.quantity, 0)} items</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 min-h-[300px] max-h-[400px]">
          {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-foreground/40 py-12">
               <ShoppingCart className="w-12 h-12 mb-3 text-foreground/20" />
               <p className="font-medium text-foreground/60">Your cart is empty.</p>
               <p className="text-sm mt-1">Add items from the list to begin.</p>
             </div>
          ) : (
             <ul className="space-y-3 p-3">
               {cart.map(item => (
                 <li key={item.product_id} className="flex justify-between items-center bg-silver-50/30 dark:bg-prussian-blue-900/30 p-4 rounded-xl border border-border shadow-sm hover:border-cerulean-500/30 transition-colors">
                    <div className="pr-4">
                      <p className="font-bold text-foreground truncate">{item.product_name}</p>
                      <p className="text-xs font-semibold text-foreground/50 mt-1">${(item.price || 0).toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-cerulean-500">
                        <input 
                          type="number" 
                          min="0" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 0)}
                          className="w-14 p-2 text-center text-sm font-bold text-foreground bg-transparent outline-none focus:outline-none"
                        />
                      </div>
                      <span className="font-black w-16 text-right text-foreground">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                 </li>
               ))}
             </ul>
          )}
        </div>
        <div className="bg-silver-50 dark:bg-prussian-blue-900/50 border-t border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-foreground/50 uppercase tracking-widest">Order Total</span>
            <span className="text-4xl font-black text-foreground">${total.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleSubmit}
            className="w-full bg-cerulean-600 disabled:bg-silver-300 dark:disabled:bg-prussian-blue-800 disabled:text-foreground/40 disabled:cursor-not-allowed text-silver-50 font-bold py-4 rounded-xl hover:bg-cerulean-500 transition-colors shadow-sm text-lg active:scale-95 duration-150 flex justify-center items-center focus:outline-none focus:ring-4 focus:ring-cerulean-500/50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 opacity-70" />
                Processing...
              </>
            ) : 'Submit Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
