import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const sb = getSupabaseServer()
  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('product_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
