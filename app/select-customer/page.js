import { supabase } from "@/lib/db";
import { setCustomerSession } from "./actions";
import { AlertTriangle } from "lucide-react";

export default async function SelectCustomerPage() {
  let customers = [];
  try {
    const { data, error } = await supabase.from('customers').select('customer_id, full_name, email').limit(100);
    if (error) throw error;
    customers = data || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">Select Customer</h1>
        <p className="text-lg text-foreground/60">
          Choose a customer to act as for this session. <br/> No authentication is required for this demo.
        </p>
      </div>
      
      <div className="bg-card shadow-xl rounded-2xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-silver-50/80 dark:bg-prussian-blue-900/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground/50 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.customer_id} className="hover:bg-silver-50/50 dark:hover:bg-prussian-blue-800/30 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-foreground/50">#{c.customer_id}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-foreground">{c.full_name}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-foreground/50">{c.email}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <form action={setCustomerSession}>
                      <input type="hidden" name="customer_id" value={c.customer_id} />
                      <button type="submit" className="inline-flex items-center justify-center text-sm font-bold text-silver-50 bg-cerulean-600 hover:bg-cerulean-500 px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer focus:outline-none focus:ring-4 focus:ring-cerulean-500/50 active:scale-95 duration-200">
                        Select
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <div className="p-12 text-center text-foreground/50 flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-foreground/30 mb-4" />
            <h3 className="text-sm font-medium text-foreground">No customers found</h3>
            <p className="mt-1 text-sm text-foreground/50">Is shop.db populated with customer data?</p>
          </div>
        )}
      </div>
    </div>
  );
}
