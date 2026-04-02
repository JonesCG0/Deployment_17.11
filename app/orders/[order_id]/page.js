import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Clock, Box } from "lucide-react";

export default async function OrderDetailPage({ params }) {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");
  
  const { order_id } = await params;

  let order, items = [];
  try {
    const { data: orderData } = await supabase.from('orders')
      .select('order_id, order_datetime, order_total')
      .eq('order_id', order_id)
      .eq('customer_id', customerId)
      .single();

    if (orderData) {
      order = orderData;
      const { data: itemsData } = await supabase.from('order_items')
        .select(`
          quantity,
          unit_price,
          line_total,
          products (product_name)
        `)
        .eq('order_id', order_id);
      
      if (itemsData) {
        items = itemsData.map(i => ({
          product_name: i.products?.product_name,
          quantity: i.quantity,
          price: i.unit_price,
          line_total: i.line_total
        }));
      }
    }
  } catch(e) {
    console.error(e);
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center p-12 bg-card text-card-foreground shadow-sm rounded-2xl border border-destructive/20 relative overflow-hidden">
        <Package className="w-24 h-24 mx-auto text-destructive/10 mb-6" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Order Not Found</h1>
        <p className="text-foreground/70 mb-8">We couldn't track down this order in your history.</p>
        <Link href="/orders" className="text-cerulean-600 dark:text-cerulean-400 font-semibold hover:text-cerulean-500 hover:underline inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/orders" className="group text-sm font-bold text-cerulean-600 dark:text-cerulean-400 hover:text-cerulean-500 mb-6 inline-flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </Link>
        <div className="flex justify-between items-start mt-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Box className="w-8 h-8 text-cerulean-500" />
              Order #{order.order_id}
            </h1>
            <p className="text-foreground/60 mt-2 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-foreground/40" />
              {new Date(order.order_datetime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-deep-mocha-100 text-deep-mocha-800 dark:bg-deep-mocha-900/50 dark:text-deep-mocha-300 ring-1 ring-deep-mocha-600/20 shadow-sm">Processing</span>
          </div>
        </div>
      </div>

      <div className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-silver-50/50 dark:bg-prussian-blue-900/50">
          <h2 className="text-lg font-bold">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-card">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-foreground/50 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground/50 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground/50 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-silver-100/50 dark:hover:bg-prussian-blue-800/20 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold">{item.product_name}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-foreground/70 text-center">{item.quantity}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-foreground/60 text-right">${(item.price || 0).toFixed(2)}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-right">${(item.line_total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-silver-50 dark:bg-prussian-blue-900/50">
              <tr>
                <td colSpan="3" className="px-6 py-5 text-right font-bold text-foreground/60 uppercase">Subtotal</td>
                <td className="px-6 py-5 text-right font-black text-xl text-cerulean-600 dark:text-cerulean-400">${(order.order_total || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
