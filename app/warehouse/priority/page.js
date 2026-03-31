import { supabase } from "@/lib/db";
import { ShieldAlert, Activity, ShieldCheck, SearchX } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PriorityQueuePage() {
  let queue = [];
  try {
    const { data: predictions } = await supabase.from('order_predictions')
      .select(`
        late_delivery_probability,
        predicted_late_delivery,
        prediction_timestamp,
        orders (
          order_id,
          order_datetime,
          order_total,
          customers (
            customer_id,
            full_name
          )
        )
      `)
      .order('late_delivery_probability', { ascending: false })
      .limit(50);
      
    if (predictions) {
      queue = predictions.map(p => ({
        order_id: p.orders?.order_id,
        order_datetime: p.orders?.order_datetime,
        order_total: p.orders?.order_total,
        customer_id: p.orders?.customers?.customer_id,
        customer_name: p.orders?.customers?.full_name,
        late_delivery_probability: p.late_delivery_probability,
        predicted_late_delivery: p.predicted_late_delivery,
        prediction_timestamp: p.prediction_timestamp
      }));
      // Filter out those where ordering might have failed if relation is empty
      queue = queue.filter(q => q.order_id);
    }
  } catch(e) { 
    console.error(e); 
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-prussian-blue-950 dark:bg-prussian-blue-900 rounded-3xl p-8 text-silver-50 shadow-xl relative overflow-hidden border border-prussian-blue-800">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10 text-cerulean-500 pointer-events-none">
          <Activity className="w-96 h-96" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-lobster-pink-500" />
            Late Delivery Priority Queue
          </h1>
          <p className="text-silver-300 max-w-2xl text-lg mt-4">
            This operational dashboard displays unfulfilled orders prioritized by their probability of arriving late. 
            The ML model evaluates warehouse factors to surface high-risk orders to the top of the queue for immediate action.
          </p>
        </div>
      </div>

      <div className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-silver-50/50 dark:bg-prussian-blue-900/50 flex justify-between items-center">
          <h2 className="text-lg font-bold">Top 50 Orders to Process</h2>
          <span className="bg-lobster-pink-100 dark:bg-lobster-pink-900/50 text-lobster-pink-800 dark:text-lobster-pink-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center border border-lobster-pink-200 dark:border-lobster-pink-800">
            <span className="w-2 h-2 rounded-full bg-lobster-pink-500 mr-2"></span>
            Critical Queue
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-card">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground/50 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-lobster-pink-600 dark:text-lobster-pink-400 uppercase tracking-wider bg-lobster-pink-50/50 dark:bg-lobster-pink-950/20 rounded-tl-lg">Risk Score</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground/50 uppercase tracking-wider">Last Scored</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queue.map((o, idx) => (
                <tr key={o.order_id} className={`hover:bg-silver-100/50 dark:hover:bg-prussian-blue-800/20 transition-colors ${idx < 3 ? 'bg-lobster-pink-50/30 dark:bg-lobster-pink-950/10' : ''}`}>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-foreground">#{o.order_id}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-foreground/80">{o.customer_name}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-foreground/60">{new Date(o.order_datetime).toLocaleDateString()}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-foreground text-right">${(o.order_total||0).toFixed(2)}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-center bg-lobster-pink-50/20 dark:bg-lobster-pink-950/10">
                     <span className={`px-3 py-1 rounded-md text-sm font-black shadow-sm flex items-center justify-center gap-1.5 w-fit mx-auto ${
                       o.late_delivery_probability > 0.8 ? 'bg-lobster-pink-500 text-white' : 
                       o.late_delivery_probability > 0.5 ? 'bg-deep-mocha-500 text-white' : 
                       'bg-cerulean-500 text-white'
                     }`}>
                       {o.late_delivery_probability > 0.8 && <ShieldAlert className="w-4 h-4" />}
                       {o.late_delivery_probability <= 0.8 && o.late_delivery_probability > 0.5 && <Activity className="w-4 h-4" />}
                       {o.late_delivery_probability <= 0.5 && <ShieldCheck className="w-4 h-4" />}
                       {(o.late_delivery_probability * 100).toFixed(1)}%
                     </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-xs font-medium text-foreground/50 text-right">
                    {new Date(o.prediction_timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short'})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {queue.length === 0 && (
            <div className="p-16 text-center text-foreground/50">
              <SearchX className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Priority Data Found</h3>
              <p className="max-w-md mx-auto text-foreground/60">The prediction queue is currently empty. Place some orders and run the ML Scoring job to populate this dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
