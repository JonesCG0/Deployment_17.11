export interface Customer {
  customer_id: string
  full_name: string
  email: string
  gender: string
  birthdate: string
  created_at: string
  city: string
  state: string
  zip_code: string
  customer_segment: string
  loyalty_tier: string
  is_active: boolean
}

export interface Product {
  product_id: string
  sku: string
  product_name: string
  category: string
  price: number
  cost: number
  is_active: boolean
}

export interface Order {
  order_id: string
  customer_id: string
  order_datetime: string
  billing_zip: string
  shipping_zip: string
  shipping_state: string
  payment_method: string
  device_type: string
  ip_country: string
  promo_used: boolean
  promo_code: string | null
  order_subtotal: number
  shipping_fee: number
  tax_amount: number
  order_total: number
  risk_score: number | null
  is_fraud: boolean | null
  shipments?: Shipment[]
}

export interface OrderItem {
  order_item_id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface Shipment {
  shipment_id: string
  order_id: string
  ship_datetime: string
  carrier: string
  shipping_method: string
  distance_band: string
  promised_days: number
  actual_days: number | null
  late_delivery: boolean | null
  late_score: number | null
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface DashboardStats {
  total_orders: number
  lifetime_spend: number
  avg_order_value: number
  orders_this_month: number
  recent_orders: Order[]
}

export interface WarehouseRow {
  shipment_id: string
  order_id: string
  carrier: string
  shipping_method: string
  distance_band: string
  promised_days: number
  actual_days: number | null
  late_score: number | null
  orders: {
    order_id: string
    customer_id: string
    order_datetime: string
    order_total: number
  } | null
}
