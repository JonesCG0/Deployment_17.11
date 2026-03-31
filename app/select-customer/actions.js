'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function setCustomerSession(formData) {
  const customerId = formData.get('customer_id');
  if (customerId) {
    const cookieStore = await cookies();
    cookieStore.set('customer_id', customerId, { path: '/' });
    redirect('/dashboard');
  }
}
