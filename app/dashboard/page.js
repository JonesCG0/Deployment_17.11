import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/db";
import Link from "next/link";
import { User, ShoppingBag, DollarSign, ArrowRight, ArrowRightCircle } from "lucide-react";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;

  if (!customerId) {
    redirect("/select-customer");
  }

  let customer, orderStats, recentOrders;
  try {
    const { data: custData } = await supabase.from('customers').select('*').eq('customer_id', customerId).single();
    customer = custData;

    const { data: orders } = await supabase.from('orders')
      .select('order_id, order_datetime, order_total')
      .eq('customer_id', customerId)
      .order('order_datetime', { ascending: false });
      
    if (orders) {
      orderStats = {
        total_orders: orders.length,
        total_spend: orders.reduce((sum, order) => sum + Number(order.order_total), 0)
      };
      recentOrders = orders.slice(0, 5);
    }
  } catch(e) {
    console.error(e);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 shadow-sm rounded-2xl border border-border hover:border-cerulean-500/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-cerulean-100 dark:bg-cerulean-900/40 rounded-xl text-cerulean-600 dark:text-cerulean-400">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Customer Profile</h2>
          </div>
          <div className="text-xl font-bold text-foreground">{customer?.full_name}</div>
          <div className="text-sm text-foreground/50 mt-1 font-mono">{customer?.email}</div>
        </div>
        
        <div className="bg-card p-6 shadow-sm rounded-2xl border border-border hover:border-deep-mocha-500/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-deep-mocha-100 dark:bg-deep-mocha-900/40 rounded-xl text-deep-mocha-600 dark:text-deep-mocha-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Total Orders</h2>
          </div>
          <div className="text-4xl font-black text-foreground">{orderStats?.total_orders || 0}</div>
        </div>
        
        <div className="bg-card p-6 shadow-sm rounded-2xl border border-border hover:border-lobster-pink-500/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-lobster-pink-100 dark:bg-lobster-pink-900/40 rounded-xl text-lobster-pink-600 dark:text-lobster-pink-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Lifetime Value</h2>
          </div>
          <div className="text-4xl font-black text-foreground">${(orderStats?.total_spend || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-card shadow-sm rounded-2xl border border-border mt-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-silver-50/50 dark:bg-prussian-blue-900/50">
          <h3 className="text-lg font-bold text-foreground">Recent Orders</h3>
          <Link href="/orders" className="group text-sm font-medium text-cerulean-600 dark:text-cerulean-400 hover:text-cerulean-500 flex items-center transition-colors cursor-pointer">
            View all order history
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-card">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders && recentOrders.map(o => (
                <tr key={o.order_id} className="hover:bg-silver-100/50 dark:hover:bg-prussian-blue-800/20 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-cerulean-600 dark:text-cerulean-400">
                    <Link href={`/orders/${o.order_id}`} className="hover:underline flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-cerulean-500/50 rounded-md decoration-2 underline-offset-4">
                      #{o.order_id} <ArrowRightCircle className="w-4 h-4 opacity-50" />
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-sm text-foreground/80 font-medium">{new Date(o.order_datetime).toLocaleString()}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-foreground">${(o.order_total || 0).toFixed(2)}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-deep-mocha-100 text-deep-mocha-800 dark:bg-deep-mocha-900/50 dark:text-deep-mocha-300 ring-1 ring-deep-mocha-600/20 shadow-sm">Processing</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!recentOrders || recentOrders.length === 0) && (
          <div className="p-12 text-center text-foreground/50">
            <ShoppingBag className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="text-lg font-medium text-foreground/80">No recent orders found.</p>
            <Link href="/place-order" className="mt-4 flex items-center justify-center gap-2 group text-cerulean-600 dark:text-cerulean-400 font-bold hover:underline cursor-pointer">
              Place your first order <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
