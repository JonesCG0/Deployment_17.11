import { supabase } from "@/lib/db";
import PlaceOrderForm from "./PlaceOrderForm";
import { placeOrderAction } from "./actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PlaceOrderPage() {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");

  let products = [];
  try {
    const { data, error } = await supabase.from('products').select('product_id, product_name, price');
    if (error) throw error;
    products = data || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Place New Order</h1>
      <PlaceOrderForm products={products} action={placeOrderAction} />
    </div>
  );
}
