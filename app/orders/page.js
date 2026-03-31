import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Plus, Eye } from "lucide-react";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");

  let orders = [];
  try {
    const { data: ordersData, error } = await supabase.from('orders')
      .select('order_id, order_datetime, order_total')
      .eq('customer_id', customerId)
      .order('order_datetime', { ascending: false });
    
    if (error) throw error;
    orders = ordersData || [];
  } catch(e) {
    console.error(e);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Order History</h1>
          <p className="text-foreground/60 mt-2">View and track all your previous orders.</p>
        </div>
        <Link href="/place-order" className="flex items-center gap-2 bg-cerulean-600 text-silver-50 font-bold py-2.5 px-5 rounded-xl hover:bg-cerulean-500 cursor-pointer focus:outline-none focus:ring-4 focus:ring-cerulean-500/50 transition-all shadow-sm active:scale-95 duration-200">
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>
      
      <div className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-silver-50/50 dark:bg-prussian-blue-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Date Time</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Total Value</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-foreground/50 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map(o => (
              <tr key={o.order_id} className="hover:bg-silver-100/50 dark:hover:bg-prussian-blue-800/20 transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-foreground">
                  #{o.order_id}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-foreground/60">
                  {new Date(o.order_datetime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-foreground">
                  ${(o.order_total || 0).toFixed(2)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-deep-mocha-100 text-deep-mocha-800 dark:bg-deep-mocha-900/50 dark:text-deep-mocha-300 ring-1 ring-deep-mocha-600/20 shadow-sm">Processing</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold">
                  <Link href={`/orders/${o.order_id}`} className="inline-flex items-center gap-1.5 text-cerulean-600 dark:text-cerulean-400 hover:text-cerulean-700 dark:hover:text-cerulean-300 bg-cerulean-50 dark:bg-cerulean-900/30 px-3 py-1.5 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-cerulean-500/50">
                    <Eye className="w-4 h-4" /> View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-16 text-center text-foreground/50 flex flex-col items-center">
            <ShoppingCart className="w-16 h-16 text-foreground/30 mb-4" />
            <p className="text-lg font-medium text-foreground">No orders found.</p>
            <p className="mt-1 text-foreground/60">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
