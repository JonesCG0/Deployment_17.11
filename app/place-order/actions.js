'use server'
import crypto from 'crypto';
import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function placeOrderAction(cartItems) {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");

  try {
    let totalValue = 0;
    for (const item of cartItems) {
      totalValue += item.price * item.quantity;
    }

    const orderId = crypto.randomUUID();
    const { error: orderError } = await supabase.from('orders').insert({
      order_id: orderId,
      customer_id: customerId,
      order_subtotal: totalValue,
      order_total: totalValue,
      order_datetime: new Date().toISOString()
    });

    if (orderError) throw orderError;

    const orderItemsPayload = cartItems.map(item => ({
      order_item_id: crypto.randomUUID(),
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
      line_total: item.quantity * item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
    if (itemsError) throw itemsError;

  } catch (err) {
    console.error("Failed to place order:", err);
    throw new Error('Failed to save order.');
  }
  
  redirect("/orders");
}
