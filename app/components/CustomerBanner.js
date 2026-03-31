import { cookies } from "next/headers";
import { supabase } from "@/lib/db";
import Link from 'next/link';
import { UserCircle2, ArrowRightLeft, TriangleAlert } from 'lucide-react';

export default async function CustomerBanner() {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;

  if (!customerId) return null;

  try {
    const { data: customer, error } = await supabase.from('customers').select('full_name, email').eq('customer_id', customerId).single();
    if (error) throw error;

    if (!customer) return null;

    return (
      <div className="bg-prussian-blue-950 dark:bg-silver-50 text-silver-100 dark:text-prussian-blue-900 px-4 py-1.5 flex justify-between items-center text-xs font-semibold uppercase tracking-widest shadow-inner relative z-50">
        <span className="flex items-center space-x-2">
          <UserCircle2 className="w-4 h-4 text-cerulean-400 dark:text-cerulean-600" />
          <span>Session: {customer.full_name} <span className="opacity-60 lowercase font-mono tracking-normal ml-1">({customer.email})</span></span>
        </span>
        <Link href="/select-customer" className="flex items-center space-x-1 hover:text-cerulean-400 dark:hover:text-cerulean-600 transition-colors">
          <ArrowRightLeft className="w-3 h-3" />
          <span>Switch Account</span>
        </Link>
      </div>
    );
  } catch (err) {
    return (
      <div className="bg-lobster-pink-500 text-white p-2 text-xs flex items-center justify-center font-bold">
        <TriangleAlert className="w-4 h-4 mr-2" />
        DB Error: {err.message}
      </div>
    );
  }
}
